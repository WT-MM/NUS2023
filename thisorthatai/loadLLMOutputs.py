import glob
from loadFirestore import *
import csv


# Get all csv files in LLMOutputs
csvFiles = glob.glob("LLMOutputs/*.csv")

loadedData = {}

# Loop through all csv files
for csvFile in csvFiles:
    modelName = csvFile.split("\\")[1].split(".")[0]
    with open(csvFile) as f:
        data = list(csv.reader(f))
    data = [mm for mm in data if mm]
    for prompt, res in data:
        number = str(len(loadedData.keys()) + 1).zfill(6)
        if prompt not in [x['prompt'] for x in loadedData.values()]:
            loadedData[number] = {"prompt": prompt, "model": [], "response" : []}
        else:
            number = [x for x in loadedData if loadedData[x]['prompt'] == prompt][0]
        loadedData[number]["model"].append(modelName)
        loadedData[number]["response"].append(res)


importData({"text": loadedData})
