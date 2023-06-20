import math
import os
import sys

#This only works for sets of 16 images w/ same model, category, different prompts

def getImages():
    imageNames = []
    for file in os.listdir("input"):
        if(file.split(".")[1] != "png"):
            continue
        imageNames.append("input/" + file)
    return imageNames


model = sys.argv[1]
category = sys.argv[2]

# EXAMPLE: python imgRename.py sd1.5 style

# Rename each image and put in output

'''
0, 1, 2, 3, 4, 5, 6,  7,  8,  9,  10, 11, 12, 13, 14, 15
4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
'''

for file in getImages():
    num = int((file.split("/")[1]).split("-")[0])+4
    newFileName = model + "_" + category + "_" + str(math.floor(num/4)) + "_" + str(num%4+1) + ".png"
    os.rename(file, "output/" + newFileName)