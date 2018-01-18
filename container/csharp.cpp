#include <bits/stdc++.h>
#include <unistd.h>

using namespace std;

int main(int argc, char **argv) {
	const char* name = "Main.exe";
	const char* CSHARP_PATH = "/usr/bin/mono";
	execl(CSHARP_PATH,CSHARP_PATH,"--debug",name,(char*)NULL);
}
