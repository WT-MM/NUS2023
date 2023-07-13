import csv


with open("prompts.txt") as f:
    prompts = f.read().split("\n")

with open("formattedPrompts.csv", "w") as f:
    writer = csv.writer(f)
    for prompt in prompts:
        writer.writerow([prompt + ". Please limit your response to 120 words or less", ""])