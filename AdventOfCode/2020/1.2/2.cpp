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
        for (int j = 1; j < arr.size(); j++)
        {
            for (int k = 1; k < arr.size(); k++)
            {
                if (arr[i] + arr[j] + arr[k] == 2020)
                {
                    return arr[i] * arr[j] * arr[k];
                }
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