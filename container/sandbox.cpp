#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <pthread.h>
#include <sys/wait.h>
#include <sys/resource.h>
#include <bits/stdc++.h>

using namespace std;
enum RUNNING_FLAG
{
	OK = 0, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, OUTPUT_LIMIT_EXCEEDED, RUNTIME_ERROR
};
const pid_t SANDBOX_UID = 1111;
const pid_t SANDBOX_GID = 1111;

unsigned long parse_long(char *str) {
	unsigned long x = 0;
	for (char *p = str; *p; p++)
		x = x * 10 + *p - '0';
	return x;
}


pid_t pid;
long time_limit_to_watch;
bool time_limit_exceeded_killed;

void *watcher_thread(void *arg) {
	sleep(time_limit_to_watch);
	kill(pid, SIGKILL);
	time_limit_exceeded_killed = true;
	return arg; // Avoid 'parameter set but not used' warning
}

int main(int argc, char **argv) {
	if (argc < 12 + 1) {
		fprintf(stderr, "Error: need 12 arguments\n");
		fprintf(stderr,
		        "Usage: %s program file_stdin file_stdout file_stderr time_limit time_limit_reserve memory_limit memory_limit_reserve large_stack output_limit process_limit file_result\n",
		        argv[0]);
		return 1;
	}

	if (getuid() != 0) {
		fprintf(stderr, "Error: need root privileges\n");
		return 1;
	}
	//char *option = argv[13];
	char *program = argv[1],
			*file_stdin = argv[2],
			*file_stdout = argv[3],
			*file_stderr = argv[4],
			*file_result = argv[12];
	long time_limit = parse_long(argv[5]),
			time_limit_reserve = parse_long(argv[6]),
			memory_limit = parse_long(argv[7]),
			memory_limit_reserve = parse_long(argv[8]),
			large_stack = parse_long(argv[9]),
			output_limit = parse_long(argv[10]),
			process_limit = parse_long(argv[11]);

	time_limit_to_watch = time_limit + time_limit_reserve;

#ifdef LOG
	printf("Program: %s\n", program);
	printf("Standard input file: %s\n", file_stdin);
	printf("Standard output file: %s\n", file_stdout);
	printf("Standard error file: %s\n", file_stderr);
	printf("Time limit (seconds): %lu + %lu\n", time_limit, time_limit_reserve);
	printf("Memory limit (kilobytes): %lu + %lu\n", memory_limit, memory_limit_reserve);
	printf("Output limit (bytes): %lu\n", output_limit);
	printf("Process limit: %lu\n", process_limit);
	printf("Result file: %s\n", file_result);
#endif

	pid = fork();
	if (pid > 0) {
		// Parent process
		int RUNTIME_FLAG = 0;
		FILE *fresult = fopen(file_result, "w");
		if (!fresult) {
			printf("Failed to open result file '%s'.", file_result);
			return -1;
		}

		if (time_limit) {
			pthread_t thread_id;
			pthread_create(&thread_id, NULL, &watcher_thread, NULL);
		}
		struct rusage usage;
		int status;
		if (wait4(pid, &status, 0, &usage) == -1) {
			fprintf(fresult, "Runtime Error\nwait4() = -1\n0\n0\n");
			return 0;
		}
		long used_time = usage.ru_utime.tv_sec * 1000 + usage.ru_utime.tv_usec / 1000 + usage.ru_stime.tv_sec * 1000 +
		                 usage.ru_stime.tv_usec / 1000;
		if (WIFEXITED(status)) {
			// Not signaled - exited normally
			int sig = WTERMSIG(status);
			if (WEXITSTATUS(status) != 0) {
				fprintf(fresult, "Runtime Error\nWIFEXITED - WEXITSTATUS() = %d\n", WEXITSTATUS(status));
				RUNTIME_FLAG = RUNTIME_ERROR;
			} else if (usage.ru_maxrss > memory_limit * 1024) {
				RUNTIME_FLAG = MEMORY_LIMIT_EXCEEDED;
				fprintf(fresult, "Memory Limit Exceeded\nWEXITSTATUS() = %d, WTERMSIG() = %d (%s)\n",
				        WEXITSTATUS(status), sig, strsignal(sig));
			} else {
				RUNTIME_FLAG = OK;
				fprintf(fresult, "Exited Normally\nWIFEXITED - WEXITSTATUS() = %d\n", WEXITSTATUS(status));
			}
		} else {
			// Signaled
			int sig = WTERMSIG(status);
			if (sig == SIGXCPU || used_time > time_limit || time_limit_exceeded_killed) {
				RUNTIME_FLAG = TIME_LIMIT_EXCEEDED;
				fprintf(fresult, "Time Limit Exceeded\nWEXITSTATUS() = %d, WTERMSIG() = %d (%s)\n", WEXITSTATUS(status),
				        sig, strsignal(sig));
			} else if (sig == SIGXFSZ) {
				RUNTIME_FLAG = OUTPUT_LIMIT_EXCEEDED;
				fprintf(fresult, "Output Limit Exceeded\nWEXITSTATUS() = %d, WTERMSIG() = %d (%s)\n",
				        WEXITSTATUS(status), sig, strsignal(sig));
			} else if (usage.ru_maxrss > memory_limit * 1024) {
				RUNTIME_FLAG = MEMORY_LIMIT_EXCEEDED;
				fprintf(fresult, "Memory Limit Exceeded\nWEXITSTATUS() = %d, WTERMSIG() = %d (%s)\n",
				        WEXITSTATUS(status), sig, strsignal(sig));
			} else {
				RUNTIME_FLAG = RUNTIME_ERROR;
				fprintf(fresult, "Runtime Error\nWEXITSTATUS() = %d, WTERMSIG() = %d (%s)\n", WEXITSTATUS(status), sig,
				        strsignal(sig));
			}
		}

#ifdef LOG
		printf("memory_usage = %ld\n", usage.ru_maxrss);
#endif
		if (time_limit_exceeded_killed)
			fprintf(fresult, "%ld\n", time_limit_to_watch * 1000000);
		else
			fprintf(fresult, "%ld\n", used_time/*usage.ru_utime.tv_sec * 1000000 + usage.ru_utime.tv_usec*/);
		fprintf(fresult, "%ld\n", usage.ru_maxrss);
		/*
		fprintf(fresult, "time:%ld memory:%ld",
		        usage.ru_utime.tv_sec * 1000 + usage.ru_utime.tv_usec / 1000 + usage.ru_stime.tv_sec * 1000 +
		        usage.ru_stime.tv_usec / 1000,
		        usage.ru_maxrss
		);*/
		fprintf(fresult, "%d\n", RUNTIME_FLAG);
		fclose(fresult);
	} else {
#ifdef LOG
		puts("Entered child process.");
#endif

		// Child process

		if (time_limit) {
			struct rlimit lim;
			lim.rlim_cur = time_limit + time_limit_reserve;
			lim.rlim_max = time_limit + time_limit_reserve;
			setrlimit(RLIMIT_CPU, &lim);
		}

		if (memory_limit && strcmp(program, "Main") == 0) {
			struct rlimit lim;
			lim.rlim_cur = (memory_limit + memory_limit_reserve) * 1024 * 1024;
			lim.rlim_max = (memory_limit + memory_limit_reserve) * 1024 * 1024;
			setrlimit(RLIMIT_AS, &lim);
			if (large_stack) {
				setrlimit(RLIMIT_STACK, &lim);
			}
		}

		if (output_limit) {
			struct rlimit lim;
			lim.rlim_cur = output_limit;
			lim.rlim_max = output_limit;
			setrlimit(RLIMIT_FSIZE, &lim);
		}

		if (process_limit) {
			struct rlimit lim;
			lim.rlim_cur = process_limit + 1;
			lim.rlim_max = process_limit + 1;
			setrlimit(RLIMIT_NPROC, &lim);
		}

#ifdef LOG
		puts("Entering target program...");
#endif

		chdir("/sandbox");

		setuid(SANDBOX_UID);
		setgid(SANDBOX_GID);

		if (strlen(file_stdin))
			freopen(file_stdin, "r", stdin);
		else
			freopen("/dev/null", "r", stdin);

		if (strlen(file_stdout))
			freopen(file_stdout, "w", stdout);
		else
			freopen("/dev/null", "w", stdout);

		if (strlen(file_stderr))
			freopen(file_stderr, "w", stderr);
		else
			freopen("/dev/null", "w", stderr);
		//printf("start program");
		execlp(program, program, to_string(memory_limit).c_str(), to_string(memory_limit_reserve).c_str(),
		       (char *) NULL);
	}

	return 0;
}
