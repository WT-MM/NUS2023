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
    for prompt, res in data:
        if prompt not in loadedData:
            loadedData[prompt] = {"model": [], "response" : []}
        loadedData[prompt]["model"].append(modelName)
        loadedData[prompt]["response"].append(res)


importData({"data": loadedData})
