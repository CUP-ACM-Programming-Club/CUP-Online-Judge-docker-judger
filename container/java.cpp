#include <bits/stdc++.h>
#include <unistd.h>

using namespace std;

int main(int argc, char **argv) {
	char JAVA_XMS[30], JAVA_XMX[30];
	sprintf(JAVA_XMS, "-Xms1024M");
	//string heap_size = to_string(atoi(argv[1]) + 100);
	sprintf(JAVA_XMX, "-Xmx2048M");
	const char *name = "Main";
	const char *JAVA_PATH = "/usr/bin/java";
	execl(JAVA_PATH, JAVA_PATH, JAVA_XMS, JAVA_XMX, "-classpath", "/sandbox", "-Djava.security.manager",
	      "-Djava.security.policy=/sandbox/java.policy", name, (char *) NULL);
}
