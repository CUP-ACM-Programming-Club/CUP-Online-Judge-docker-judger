#include <bits/stdc++.h>
#include <unistd.h>
using namespace std;
int main()
{
	const char* name="/sandbox/Main.py";
	const char* PYTHON_PATH="/usr/bin/python3";
	execl(PYTHON_PATH,PYTHON_PATH,name,(char*)NULL);
}
