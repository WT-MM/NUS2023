import csv
import time
import os
from dotenv import load_dotenv

import pprint
import google.generativeai as palm

load_dotenv()

palm.configure(api_key=os.environ.get('PALM_KEY'))


with open("prompts.txt") as f:
    prompts = f.read().split("\n")

output = []

'''
for model in palm.list_models():
    print(model)
'''

for prompt in prompts:
    print("Generating for prompt: " + prompt)
    response = palm.generate_text(model="models/text-bison-001", prompt=prompt+ ". Limit responses under 80 words or less", max_output_tokens=200, temperature=0.8)
    if(response.result == None):
        response.result = "Blocked for safety reasons"
    print("Response: " + response.result)
    output.append([prompt, response.result])
    with open("liveOutputs.csv", "a") as f:
        writer = csv.writer(f)
        writer.writerow([prompt, response.result])
    time.sleep(5)


with open("palmOutputs.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerows(output)
