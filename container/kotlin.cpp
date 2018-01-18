#include <bits/stdc++.h>
#include <unistd.h>

using namespace std;

int main(int argc, char **argv) {
	const char *name = "/sandbox/Main.jar";
	const char *JAVA_PATH = "/usr/bin/java";
	execl(JAVA_PATH, JAVA_PATH, "-jar", name, (char *) NULL);
}
