#include <bits/stdc++.h>
#include <unistd.h>
using namespace std;
int main()
{
	const char* name = "/sandbox/Main.js";
	const char* NODE_PATH = "/usr/bin/node";
	execl(NODE_PATH, NODE_PATH, name,(char*)NULL);
}
