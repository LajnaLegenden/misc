import requests
import os
import random
from math import floor
from time import sleep
chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
for i in range(10000):
    sleep(1)
    name = chars[floor(random.random() * len(chars))] + chars[floor(random.random() * len(chars))] + chars[floor(random.random() * len(chars))]
    r = requests.get(
        f"https://api.mojang.com/users/profiles/minecraft/{name}".format())
    print(name, r.status_code)
    if(r.status_code == 204):
        os.system(
            f"echo {name} >> names.txt".format())
    else:
        os.system(
            f"echo {name} >> used.txt".format())
    if(r.status_code == 429):
        print(r.headers)
