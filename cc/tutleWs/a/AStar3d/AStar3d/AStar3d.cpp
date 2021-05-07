// AStar3d.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include "json.hpp"
#include <fstream>
#include <streambuf>
#include <iomanip>
#include <vector>


using json = nlohmann::json;
using namespace std;

class Block {
public:
	double f = 0, g = 0, h = 0;
	int x, y, z;

	bool open = false;
	bool closed = false;
	Block* cameFrom;
	bool path = false;

	bool wall = false;
	json data;
	Block(int x, int y, int z) {
		this->x = x;
		this->y = y;
		this->z = z;
	}

	Block(json blockInfo) {
		data = blockInfo;
		if (blockInfo["block"] != "air") this->wall = true;
		this->x = stoi(blockInfo["cords"]["x"].dump());
		this->y = stoi(blockInfo["cords"]["y"].dump());
		this->z = stoi(blockInfo["cords"]["z"].dump());
	}
};


class World {
public:
	vector< vector< vector<Block> > > v(n, vector< vector<Block> >(m, vector<Block>(l, 1)));

	World(json world) {

	}
};

class AStar {
public:
	AStar(json world) {
		this->world = world;
		cout << "AStar: ctor()" << endl;
	}

	json world;
	vector<Block> process(Block start, Block end) {
		int traversedNodes = 1;
		if (start.y < end.y) {
			Block tmp = end;
			end = start;
			start = tmp;
		}

		openList.push_back(start);
		openList[0].open = true;

		openList[0].g = 0;
		openList[0].h = heuristic(openList[0], end);
		openList[0].f = openList[0].h + openList[0].g;

		cout << "START X: " << start.x << " Y: " << start.y << " Z: " << start.z << " DISTANCE " << start.h << endl;
		cout << "END X: " << end.x << " Y: " << end.y << " Z: " << end.z << endl;


		while (openList.size() > 0 && traversedNodes < 20000) {
			int currentIndex = getNextIndex();
			Block currentBlock = openList[currentIndex];

			if (traversedNodes % 1000 == 0) {
				cout << traversedNodes << " - " << "X: " << currentBlock.x << " Y: " << currentBlock.y << " Z: " << currentBlock.z << endl;
			}

			if (currentBlock.x == end.x && currentBlock.y == end.y && currentBlock.z == end.z) {
				//Done
				vector<Block> path;
				Block aNode = currentBlock;

				while (aNode.cameFrom) {
					path.push_back(aNode);
					aNode.path = true;
					aNode = *aNode.cameFrom;
				}
				path.push_back(start);
				start.path = true;

				return path;
			}

			traversedNodes++;

			openList.erase(openList.begin() + currentIndex);
			currentBlock.closed = true;
			currentBlock.open = false;

			vector<Block> neighbours = getNeighbours(currentBlock);

			for (int i = 0; i < neighbours.size(); i++) {
				cout << i << endl;
				if (neighbours[i].closed || neighbours[i].wall) {
					continue;
				}

				float tentative_g = currentBlock.g + distance(currentBlock, neighbours[i]);
				cout << tentative_g << endl;
				bool tentativeIsBetter = false;

				if (!neighbours[i].open) {
					neighbours[i].h = heuristic(neighbours[i], end);
					openList.push_back(neighbours[i]);
					tentativeIsBetter = true;
				}
				else if (tentative_g < neighbours[i].g) {
					tentativeIsBetter = true;
				}
				else {
					tentativeIsBetter = false;
				}

				if (tentativeIsBetter) {

					neighbours[i].cameFrom = &currentBlock;
					neighbours[i].g = tentative_g;
					neighbours[i].f = neighbours[i].g + neighbours[i].h;
				}

				if (!neighbours[i].open) {
					neighbours[i].open = true;
					openList.push_back(neighbours[i]);
				}
			}
		}
		return vector<Block>();
	}


private:
	float heightFactor = 0.50;
	vector<Block> openList;




	float heuristic(Block a, Block b) {
		return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2) + pow(a.z - b.z, 2));
	}

	float distance(Block a, Block b) {
		return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2) * this->heightFactor + pow(a.z - b.z, 2));
	}

	int getNextIndex() {
		int nextIndex = 0;
		for (int i = 0; i < openList.size(); i++) {
			if (openList[i].f < openList[nextIndex].f) {
				nextIndex = i;
			}
		}
		return nextIndex;
	}


	vector<Block> getNeighbours(Block self) {
		int x = self.x;
		int y = self.y;
		int z = self.z;

		vector<Block> neighbours;

		if (world[to_string(x - 1)][to_string(y)][to_string(z)] == nlohmann::detail::value_t::null) {
			world[to_string(x - 1)][to_string(y)][to_string(z)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x", x - 1},
					{"y", y},
					{"z",z}
				}
			},
			};
			neighbours.push_back(Block(x - 1, y, z));
		}
		else {
			neighbours.push_back(Block(world[to_string(x - 1)][to_string(y)][to_string(z)]));
		}

		if (world[to_string(x + 1)][to_string(y)][to_string(z)] == nlohmann::detail::value_t::null) {
			world[to_string(x - 1)][to_string(y)][to_string(z)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x", x + 1},
					{"y", y},
					{"z",z}
				}
			},
			};
			neighbours.push_back(Block(x + 1, y, z));
		}
		else {
			neighbours.push_back(Block(world[to_string(x + 1)][to_string(y)][to_string(z)]));
		}

		if (world[to_string(x)][to_string(y - 1)][to_string(z)] == nlohmann::detail::value_t::null) {
			world[to_string(x)][to_string(y - 1)][to_string(z)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x", x},
					{"y", y - 1},
					{"z",z}
				}
			},
			};
			neighbours.push_back(Block(x, y - 1, z));
		}
		else {
			neighbours.push_back(Block(world[to_string(x)][to_string(y - 1)][to_string(z)]));
		}

		if (world[to_string(x)][to_string(y + 1)][to_string(z)] == nlohmann::detail::value_t::null) {
			world[to_string(x)][to_string(y + 1)][to_string(z)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x", x},
					{"y", y + 1},
					{"z",z}
				}
			},
			};
			neighbours.push_back(Block(x, y + 1, z));
		}
		else {
			neighbours.push_back(Block(world[to_string(x)][to_string(y + 1)][to_string(z)]));
		}

		if (world[to_string(x)][to_string(y)][to_string(z - 1)] == nlohmann::detail::value_t::null) {
			world[to_string(x)][to_string(y)][to_string(z - 1)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x",x},
					{"y", y},
					{"z",z - 1}
				}
			},
			};
			neighbours.push_back(Block(x, y, z - 1));
		}
		else {
			neighbours.push_back(Block(world[to_string(x)][to_string(y)][to_string(z - 1)]));
		}

		if (world[to_string(x)][to_string(y)][to_string(z + 1)] == nlohmann::detail::value_t::null) {
			world[to_string(x)][to_string(y)][to_string(z + 1)] = {
			{"modInfo", "minecraft"},
			{"block", "air"},
			{
				"cords", {
					{"x", x},
					{"y", y},
					{"z",z + 1}
				}
			},
			};
			neighbours.push_back(Block(x, y, z + 1));
		}
		else {
			neighbours.push_back(Block(world[to_string(x)][to_string(y)][to_string(z + 1)]));
		}
		return neighbours;
	}
};



int main(int argc, char** argv) {
	//Load our world as json
	json world;
	world.parse(argv[3]);



	Block start(world["517"]["152"]["530"]);
	Block end(519, 146, 533);

	AStar astar(world);
	vector<Block> res = astar.process(end, start);
	for (int i = 0; i < res.size(); i++) {
		cout << "X: " << res[i].x << " Y: " << res[i].y << " Z: " << res[i].z << endl;
	}


}
