import os
import json

def getImages():
    imageNames = []
    for file in os.listdir("webapp/static/images"):
        imageNames.append(file)
    return imageNames

def loadPrompts():
    with open("prompts.json", "r", encoding="utf-8") as f:
        prompts = json.load(f)
    return prompts

relFilePath = "static/images/"

promptKey = {"style": "Style Consistency", "perspective" : "Perspective", "creativity" : "Creativity", "beauty" : "Beauty", "composition" : "Composition", "emotion" : "Emotional Expression"}
invertedPromptKey = {v: k for k, v in promptKey.items()}

prompts = loadPrompts()

jsVar = []

for file in getImages():
    filePath = relFilePath + file
    #name = file.split(".")[0] #doesn't work because of . in version
    name = file[:-3] #Will only work if file extension is 3 characters long
    model, cat, num, _ = name.split("_")
    jsVar.append({"model": model, "category": cat, "prompt": num, "src": filePath})

# Generate prompt lookup
promptLookup = {}

for cat, prompt in prompts.items():
    enumerated = dict(enumerate(prompt,1))
    promptLookup[invertedPromptKey[cat]] = enumerated

with open("variables.js", "w", encoding="utf-8") as f:
    f.write("const images = " + json.dumps(jsVar, indent=4, ensure_ascii=False) + "\n")
    f.write("const promptLookup = " + json.dumps(promptLookup, indent=4, ensure_ascii=False) + "\n")