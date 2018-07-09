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
const int STANDARD_MEMORY = 1<<20;
const pid_t SANDBOX_UID = 1111;
const pid_t SANDBOX_GID = 1111;
const int COMPILE_MEMORY = 1024 * STANDARD_MEMORY;
const int OUTPUT_LIMIT = 20 * STANDARD_MEMORY;
const int TIME_LIMIT = 6;
int main(int argc,char** argv)
{
    chdir("/sandbox");
    setuid(SANDBOX_UID);
    setgid(SANDBOX_GID);
    if(argc<2)
    {
        cerr<<"Args must be 2"<<endl;
        return 1;
    }
    string args = argv[1];
    struct rlimit lim;
    if(args.find("java")==args.npos){
    lim.rlim_cur = COMPILE_MEMORY;
    lim.rlim_max = COMPILE_MEMORY;
    setrlimit(RLIMIT_AS,&lim);
    }
    lim.rlim_cur = TIME_LIMIT;
    lim.rlim_max = TIME_LIMIT;
    setrlimit(RLIMIT_CPU,&lim);
    lim.rlim_cur = OUTPUT_LIMIT;
    lim.rlim_max = OUTPUT_LIMIT;
    setrlimit(RLIMIT_FSIZE,&lim);
    freopen("/sandbox/compile.out","w",stdout);
    freopen("/sandbox/compile.err","w",stderr);
    system(argv[1]);
}