#include <iostream>
#include <fstream>
#include <ios>
#include <string>
#include <vector>

using namespace std;

class Policy
{
public:
    Policy(string wholeString)
    {
        whole = wholeString;

        //Find password
        int passPos = (int)whole.find(":");
        password = whole.substr(passPos + 2, whole.size() - passPos - 2);

        int dashPos = (int)whole.find("-");
        int spacePos = (int)whole.find(" ");

        posOne = stoi(whole.substr(0, dashPos));
        posTwo = stoi(whole.substr(dashPos + 1, spacePos - 1));

        letter = whole.substr(spacePos + 1, 1)[0];
    }

    int posOne;
    int posTwo;
    char letter;
    string password;
    string whole;
    int count;
};
int count(string s, char del)
{
    int count = 0;

    for (int i = 0; i < s.size(); i++)
        if (s[i] == del)
            count++;

    return count;
}

int doThing(vector<Policy> arr)
{
    int counter = 0;
    for (int i = 0; i < arr.size(); i++)
    {
        Policy obj = arr[i];

        if (obj.password[obj.posOne - 1] == obj.letter && obj.password[obj.posTwo - 1] == obj.letter)
        {
            cout << "Password " << obj.password << " is NOT valid with string " << obj.whole << endl;
        }
        else if (obj.password[obj.posOne - 1] == obj.letter)
        {
            cout << "Password " << obj.password << " is valid with string " << obj.whole << endl;
            counter++;
        }
        else if (obj.password[obj.posTwo - 1] == obj.letter)
        {
            cout << "Password " << obj.password << " is valid with string " << obj.whole << endl;
            counter++;
        }
        else
        {
            cout << "Password " << obj.password << " is NOT valid with string " << obj.whole << endl;
        }
    }
    return counter;
}

int main()
{
    //read the file
    ifstream is("input.txt");
    string str;
    vector<Policy> arr;
    while (getline(is, str))
    {
        arr.push_back(Policy(str));
    }

    int result = doThing(arr);

    if (result >= 0)
    {
        cout << "Result is " << result << endl;
    }
    return 0;
}