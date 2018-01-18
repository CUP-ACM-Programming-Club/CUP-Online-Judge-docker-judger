#include <bits/stdc++.h>
#include <unistd.h>

using namespace std;

int main(int argc, char **argv) {
	const char* name = "Main";
	const char* LUA_PATH = "/usr/bin/lua";
	execl(LUA_PATH,LUA_PATH,name,(char*)NULL);
}
