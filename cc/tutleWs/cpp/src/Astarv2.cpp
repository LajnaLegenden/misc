
#include <iostream>
#include "json.hpp"
#include <fstream>
#include <streambuf>
#include <iomanip>
#include <vector>

using json = nlohmann::json;
using namespace std;



int main(int argc, char **argv)
{

	//Load our world as json
	json world = json::parse(argv[1]);
    cout << world.dump(4);
    

    return 0;
}
