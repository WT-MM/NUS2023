import re
import json 


final = {}


with open("data/raw.txt", "r", encoding="utf-8") as f:
    bigstring = f.read()
    #Strip newlines
    bigstring = bigstring.replace("\n", "")
    biglist = bigstring.split("-")
    for thing in biglist:
        print(thing)
        print("-----")
        category, prompts = thing.split(":")
        prompts = list(filter(None, map(str.rstrip, re.split('\w\.\s', prompts))))

        final[category] = prompts

print(final)

with open("data/prompts.json", "w", encoding="utf-8") as f:
    json.dump(final, f, indent=4, ensure_ascii=False)