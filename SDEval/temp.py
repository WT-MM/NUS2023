import json

with open("prompts.json", "r", encoding="utf-8") as f:
    prompts = json.load(f)

for category, promptlist in prompts.items():
    print(category)
    for prompt in promptlist:
        print(prompt)
    print("-----")