#include <iostream>
#include <fstream>
#include <ios>
#include <string>
#include <vector>

using namespace std;

int doThing(vector<int> arr)
{
    for (int i = 0; i < arr.size(); i++)
    {
        for (int j = i + 1; j < arr.size(); j++)
        {
            if (arr[i] + arr[j] == 2020)
            {
                return arr[i] * arr[j];
            }
        }
    }
    return -1;
}

int main()
{
    //read the file
    ifstream is("input.txt");
    string str;
    vector<int> arr;
    while (getline(is, str))
    {
        arr.push_back(stoi(str));
    }

    int result = doThing(arr);

    if (result >= 0)
    {
        cout << "Result is " << result << endl;
    }
    return 0;
}