#include <bits/stdc++.h>
#include <cstdlib>
#include <unistd.h>
using namespace std;
int main(int argc,char** argv)
{
    if(argc<2)
    {
        cerr<<"Args must be 2"<<endl;
        return 1;
    }
    freopen("/sandbox/compile.out","w",stdout);
    freopen("/sandbox/compile.err","w",stderr);
    system(argv[1]);
}