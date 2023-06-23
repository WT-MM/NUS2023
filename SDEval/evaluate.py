from matplotlib import pyplot as plt
import pandas as pd
import json
import matplotlib.patches as mpatches
import numpy as np
import mplcursors




def loadPrompts():
    with open("prompts.json", "r", encoding="utf-8") as f:
        prompts = json.load(f)
    return prompts

promptKey = {"style": "Style Consistency", "perspective" : "Perspective", "creativity" : "Creativity", "beauty" : "Beauty", "composition" : "Composition", "emotion" : "Emotional Expression"}
invertedPromptKey = {v: k for k, v in promptKey.items()}

prompts = loadPrompts()

df = pd.read_csv('labels.csv')

# Load the prompts JSON
with open('prompts.json') as file:
    prompts = json.load(file)


'''
weights = df['Weights'].apply(eval).tolist()
labels = df['Labels'].apply(eval).tolist()
fileInfo = df['File'].apply(lambda x: x[:-3].split("_")).tolist()

print(fileInfo)
'''

modelData ={}
styleData = {}

for index, row in df.iterrows():
    weights = eval(row['Weights'])
    labels = eval(row['Labels'])

    fileInfo = row['File'][:-3].split("_")
    realLabel = prompts[promptKey[fileInfo[1]]][int(fileInfo[2])-1]
    
    combined = dict(zip(labels, weights))
    realWeight = combined[realLabel]

    weightDist = realWeight - weights[1] if realWeight == weights[0] else realWeight - weights[0]

    if not modelData.get(fileInfo[0]):
        modelData[fileInfo[0]] = {"dist" : [], "weight": []}

    if not styleData.get(fileInfo[1]):
        styleData[fileInfo[1]] = {}
        styleData[fileInfo[1]][fileInfo[0]] = {"dist" : [], "weight": []}
    elif not styleData[fileInfo[1]].get(fileInfo[0]):
        styleData[fileInfo[1]][fileInfo[0]] = {"dist" : [], "weight": []}

    modelData[fileInfo[0]]['dist'].append(weightDist)
    modelData[fileInfo[0]]['weight'].append(realWeight)

    styleData[fileInfo[1]][fileInfo[0]]['dist'].append(weightDist)
    styleData[fileInfo[1]][fileInfo[0]]['weight'].append(realWeight)

for model, data in modelData.items():
    print(model)
    print(f"Mean Dist: {np.mean(data['dist'])}")
    print(f"Mean Weight: {np.mean(data['weight'])}")
    print("-----")

for style, models in styleData.items():
    print(style)
    for model, data in models.items():
        print(model)
        print(f"Mean Dist: {np.mean(data['dist'])}")
        print(f"Mean Weight: {np.mean(data['weight'])}")
        print("-----")
    print("-----")

print(styleData)

data = styleData

plt.rcParams.update({'font.size': 8})



models = list(set(model for styles in data.values() for model in styles.keys()))
styles = list(data.keys())

exclude = [] # Categories to exclude - "style", "beauty", "composition", "perspective", "creativity", "emotion"

for category in exclude:
    styles.remove(category)

colors = ['b', 'g', 'r', 'c', 'm', 'y', 'k']  # Add more colors if needed
show_means = True  # Set this to False to hide the means
show_medians = True  # Set this to False to hide the medians

for model in models:
    fig, ax = plt.subplots(figsize=(6, 4))
    fig.suptitle(f'Model: {model}', fontsize=16)

    style_patches = []
    mean_lines = []
    median_lines = []

    for i, style in enumerate(styles):
        if model in data[style]:
            datapoints = data[style][model]['weight']
            color = colors[i]
            ax.hist(datapoints, bins=10, alpha=0.3, color=color, label=f'Category: {style}')
            if show_means:
                mean_value = np.mean(datapoints)
                mean_line = ax.axvline(mean_value, color=color, linestyle='solid', linewidth=2, label=f"{style} ({mean_value})")
                mean_lines.append(mean_line)
            if show_medians:
                median_value = np.median(datapoints)
                median_line = ax.axvline(median_value, color=color, linestyle='dotted', linewidth=2, label=f"{style} ({median_value})")
                median_lines.append(median_line)
            style_patch = mpatches.Patch(color=color, label=f'Category: {style}')
            style_patches.append(style_patch)

    ax.set_xlabel('Weight')
    ax.set_ylabel('Count')

    handles = style_patches

    labels = [h.get_label() for h in handles]
    legend = ax.legend(handles=handles, labels=labels, loc='best')

    mplcursors.cursor(mean_lines, hover=True).connect(
        "add", lambda sel: sel.annotation.set_text(f'Mean: {sel.artist.get_label()}')
    )

    mplcursors.cursor(median_lines, hover=True).connect(
        "add", lambda sel: sel.annotation.set_text(f'Median: {sel.artist.get_label()}')
    )

    x_corner = -0.2
    y_corner = 0.02
    for i, style in enumerate(styles):
        if show_means:
            mean_value = np.mean(data[style][model]['weight'])
            fig.text(x_corner, y_corner, f'Mean ({style}): {mean_value:.2f}', color=colors[i])
            y_corner += 0.03
        if show_medians:
            median_value = np.median(data[style][model]['weight'])
            fig.text(x_corner, y_corner, f'Median ({style}): {median_value:.2f}', color=colors[i])
            y_corner += 0.03
    fig.savefig(f'output/{model}_histogram.png', dpi=300, bbox_inches='tight')


#plt.tight_layout()
#plt.show()

'''
#For overlaid plots

models = list(set(model for styles in data.values() for model in styles.keys()))
styles = list(data.keys())
colors = ['b', 'g', 'r', 'c', 'm', 'y', 'k']  # Add more colors if needed
show_means = True  # Set this to False to hide the means
show_medians = True  # Set this to False to hide the medians

for model in models:
    fig, ax = plt.subplots(figsize=(6, 4))
    fig.suptitle(f'Model: {model}', fontsize=16)

    style_patches = []
    mean_patches = []
    median_patches = []

    for i, style in enumerate(styles):
        if model in data[style]:
            datapoints = data[style][model]['weight']
            ax.hist(datapoints, bins=5, alpha=0.5, color=colors[i], label=f'Category: {style}')
            if show_means:
                mean_value = np.mean(datapoints)
                ax.axvline(mean_value, color=colors[i], linestyle='--', linewidth=2)
                #mean_patch = mpatches.Patch(color=colors[i], label=f'Mean: {style}')
                #mean_patches.append(mean_patch)
            if show_medians:
                median_value = np.median(datapoints)
                ax.axvline(median_value, color=colors[i], linestyle=':', linewidth=2)
                #median_patch = mpatches.Patch(color=colors[i], label=f'Median: {style}')
                #median_patches.append(median_patch)
            style_patch = mpatches.Patch(color=colors[i], label=f'Category: {style}')
            style_patches.append(style_patch)

    ax.set_xlabel('Weight')
    ax.set_ylabel('Count')

    legend_handles = style_patches
    if show_means:
        legend_handles += [mpatches.Patch(color='black', label='Mean', linestyle='--', linewidth=2)]
    if show_medians:
        legend_handles += [mpatches.Patch(color='black', label='Median', linestyle=':', linewidth=2)]

    ax.legend(handles=legend_handles)


plt.tight_layout()
plt.show()

'''


'''
#For separate plots for each model/style combo
models = list(set(model for styles in data.values() for model in styles.keys()))

for model in models:
    fig, axes = plt.subplots(len(data), 1, figsize=(6, 4*len(data)))
    fig.suptitle(f'Model: {model}', fontsize=16)
    for i, (style, datapoints) in enumerate(data.items()):
        if model in datapoints:
            data1 = datapoints[model]['weight']
            axes[i].hist(data1, bins=100, alpha=0.7)  # Use histogram plot with specified number of bins
            axes[i].set_xlabel('Weight')
            axes[i].set_ylabel('Count')
            axes[i].set_title(f'Category: {style}')

plt.tight_layout()
plt.show()


'''