#include <iostream>
#include <set>
#include <map>

using namespace std;

struct v_param ///város paraméterei
{
    string jellemzo_fertozes;
    set<string> kapcsolatok;
    map<string, int> fertozesek; ///aktuális fertõzések
    //int eddigi_fertozodesek;
};

class Pandemic
{
///fontos: jó struktúra (miben tároljuk el az adatokat?)
    /*map<string, string> jellemzo_fertozesek; ///ez csak egy!
      map<string, set<string>> kapcsolatok; ///irányított gráf -> irányítatlan kell
      map<string, map<string, int> aktualis_fertozesek; */

    map<string, v_param> varosok;

public:
    void uj_varos(string varos, string fertozes)
    {
        varosok[varos].jellemzo_fertozes = fertozes; ///[] létrehoz egy változót
        varosok[varos].fertozesek;
        //varosok[varos].eddigi_fertozodesek = 0;
    }

    void uj_kapcsolat(string varos1, string varos2) ///gráf
    {
        varosok[varos1].kapcsolatok.insert(varos2);
        varosok[varos2].kapcsolatok.insert(varos1); ///így lesz irányított gráfból irányítatlan <- többszörös él
    }

    void fertozes(string varos)
    {
        string aktualis_fertozes = varosok[varos].jellemzo_fertozes;
        if(varosok[varos].fertozesek.find(aktualis_fertozes) != varosok[varos].fertozesek.end())
        {
            varosok[varos].fertozesek[aktualis_fertozes] += 1;

            if(varosok[varos].fertozesek[aktualis_fertozes] > 3)
            {
                varosok[varos].fertozesek[aktualis_fertozes] = 3;
                for(string szomszed: varosok[varos].kapcsolatok)
                {
                    if(varosok[szomszed].fertozesek.find(aktualis_fertozes) != varosok[szomszed].fertozesek.end())
                    {
                        varosok[szomszed].fertozesek[aktualis_fertozes] += 1;
                    }
                    else
                    {
                        varosok[szomszed].fertozesek[aktualis_fertozes] = 1;
                    }
                }
            }
        }
        else
        {
            varosok[varos].fertozesek[aktualis_fertozes] = 1;
        }

    }

    void fertozes_kezelese(string varos, string fertozes)
    {
        varosok[varos].fertozesek[fertozes] -= 1;
    }

    void allapot_kiir()
    {
        for(auto varos: varosok) ///varos nem string!!! hanem pair<string, v_param>
        {
            if(!varos.second.fertozesek.empty()) ///van-e benne valami
            {
                cout << varos.first << "> ";
                for(auto fertozes: varos.second.fertozesek)
                {
                    if(fertozes.second != 0)
                    {
                        cout << fertozes.first << ": " << fertozes.second << ", ";
                    }
                }
                cout << endl;
            }
        }
        cout << endl;
    }
};

int main()
{
    Pandemic p;
    p.uj_varos("London", "CODA-45é");
    p.uj_varos("New York", "H1N1");
    p.uj_varos("Budapest", "CODA-45");
    p.uj_varos("Peking", "SARS-CoV-2");
    p.uj_kapcsolat("London", "Budapest");
    p.uj_kapcsolat("London", "New York");
    p.uj_kapcsolat("London", "Peking");
    p.uj_kapcsolat("Peking", "New York");
    p.uj_kapcsolat("Peking", "Budapest");
    p.fertozes("Budapest");
    p.fertozes("Budapest");
    p.fertozes("New York");
    p.fertozes("New York");
    p.fertozes("New York");
    p.allapot_kiir();
//CODA-45 jelenlet> Budapest: 2, London: 0,
//H1N1 jelenlet> New York: 3,
//SARS-CoV-2 jelenlet> Peking: 0,
///vagy
// Budapest> CODA-45: 2,
// New York> H1N1: 3,
    p.fertozes("Budapest");
    p.allapot_kiir();
//CODA-45 jelenlet> Budapest: 3, London: 0,
//H1N1 jelenlet> New York: 3,
//SARS-CoV-2 jelenlet> Peking: 0,
///vagy
// Budapest> CODA-45: 3,
// New York> H1N1: 3,

/// ideiglenesen a második részt érdemes kikommentelni

    p.fertozes("Budapest");
    p.fertozes("New York");
    p.allapot_kiir();
    //CODA-45 jelenlet> Budapest: 3, London: 1, Peking: 1,
    //H1N1 jelenlet> London: 1, New York: 3, Peking: 1,
    //SARS-CoV-2 jelenlet> Peking: 0,
    ///vagy
    // Budapest> CODA-45: 3,
    // London> CODA-45: 1, H1N1: 1,
    // New York> H1N1: 3,
    // Peking> CODA-45: 1, H1N1: 1,

    p.fertozes_kezelese("London", "CODA-45");
    p.fertozes_kezelese("New York", "H1N1");
    p.allapot_kiir();
    //CODA-45 jelenlet> Budapest: 3, London: 0, Peking: 1,
    //H1N1 jelenlet> London: 1, New York: 2, Peking: 1,
    //SARS-CoV-2 jelenlet> Peking: 0,
    ///vagy
    // Budapest> CODA-45: 3,
    // London> H1N1: 1,
    // New York> H1N1: 2,
    // Peking> CODA-45: 1, H1N1: 1,

    return 0;
}
