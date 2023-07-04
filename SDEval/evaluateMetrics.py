import os
from brisque import BRISQUE
import cv2
import json


# Path to the BRISQUE model
BRISQUE_MODEL_PATH = "/models/brisque_model_live.yml"

def calculate_brisque_score(image_path):
    img = cv2.imread(image_path)
    grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurScore = cv2.Laplacian(grey, cv2.CV_64F).var()
    score = cv2.quality.QualityBRISQUE_compute(img, "models/brisque_model_live.yml", "models/brisque_range_live.yml")
    return score[0]

#Lower is better

rootdir = 'input/brisque'

saveData = {}

for file in os.listdir(rootdir):
    if file.endswith(".png"):
        print(file)
        score = calculate_brisque_score(os.path.join(rootdir, file))
        print(score)
        saveData[file] = score

with open('output/brisque.json', 'w') as outfile:
    json.dump(saveData, outfile)

