#include <iostream>
#include "json.hpp"
#include <fstream>
#include <streambuf>
#include <iomanip>
#include <vector>
using namespace std;
using json = nlohmann::json;

class Block
{
public:
	double f = 0, g = 0, h = 0;
	int x, y, z;

	bool open = false;
	bool closed = false;
	Block *cameFrom;
	bool path = false;

	bool wall = false;
	json data;
	Block(int x, int y, int z)
	{
		this->x = x;
		this->y = y;
		this->z = z;
	}

	Block(json blockInfo)
	{
		if(blockInfo == nlohmann::detail::value_t::null){

		}
		cout << "JSON block data" << blockInfo.dump(4) << endl;
		data = blockInfo;
		if (blockInfo["block"] != "air")
			this->wall = true;
		this->x = stoi(blockInfo["cords"]["x"].dump());
		this->y = stoi(blockInfo["cords"]["y"].dump());
		this->z = stoi(blockInfo["cords"]["z"].dump());
	}
};

int main(){

map<int,map<int,map<int,int>>> world;

world[23][234][343] = 23;
cout << world[23][234][343] ;
}
