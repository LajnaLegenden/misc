#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <list>
#include <map>
using namespace std;

class Fajlkezelo
{
    list<list<string>> tartalmak;
    //Given data structure
    list<list<map<char, int>>> eredmeny;

public:
    Fajlkezelo()
    {
    }

    void beolvas(string fajlnev)
    {
        list<string> aktualis_fajl;
        string sor;
        ifstream fajl(fajlnev);
        if (fajl.is_open())
        {
            while (getline(fajl, sor))
            {
                if (sor.size() > 0)
                {
                    aktualis_fajl.push_back(sor);
                }
            }
            fajl.close();
            tartalmak.push_back(aktualis_fajl);
        }

        else
        {
            cout << "Nem sikerult megnyitni" << endl;
            return;
        }
    }

    void fajlvizsgalat()
    {
        list<list<map<char, int>>> _eredmeny;
        for (const auto &tartalom : tartalmak)
        {
            list<map<char, int>> fajlinfo;
            for (const auto &bekezdes : tartalom)
            {
                map<char, int> bekezdes_statisztika;
                for (int i = 0; i < bekezdes.size(); i++)
                {
                    char betu = bekezdes[i];
                    if (bekezdes_statisztika[betu] == NULL)
                    {
                        bekezdes_statisztika[betu] = 1;
                    }
                    else
                    {
                        bekezdes_statisztika[betu] = bekezdes_statisztika[betu] + 1;
                    }
                }
                fajlinfo.push_back(bekezdes_statisztika);
            }
            _eredmeny.push_back(fajlinfo);
        }
        eredmeny = _eredmeny;
    }
    void eredmeny_kiir()
    {
        int fajlszam = 0;
        for (const auto &fajlinfo : eredmeny)
        {
            int bekezdesszam = 0;
            for (const auto &bekezdes_statisztika : fajlinfo)
            {
                cout << "_________Fajl Szam" << fajlszam << "____________________________________________Bekezdes Szam" << bekezdesszam << "___________" << endl;
                for (auto const &betu_eredmeny : bekezdes_statisztika)
                {
                    cout << betu_eredmeny.first << " : " << betu_eredmeny.second << endl;
                }
                bekezdesszam++;
            }
            fajlszam++;
        }
    }
};

int main()
{
    Fajlkezelo fk;
    int valasztas = -1;

    cout << "Ird be a fajlnevet" << endl;
    string fajlnev;
    cin >> fajlnev;
    fk.beolvas(fajlnev);
    cout << "Nyomj 1-est uj fajlbeolvasasert, 2-est a futasert" << endl;
    cin >> valasztas;

    while (valasztas != 2)
    {
        cout << "Ird be a fajlnevet" << endl;
        string fajlnev;
        cin >> fajlnev;
        fk.beolvas(fajlnev);
        cout << "Nyomj 1-est uj fajlbeolvasasert, 2-est a futasert" << endl;
        cin >> valasztas;
    }

    fk.fajlvizsgalat();
    fk.eredmeny_kiir();
    return 0;
}
