import pickle
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

import plotly.graph_objects as go


with open('data/similarities.pkl', 'rb') as f:
    similarities = pickle.load(f)


def plotlyShow(data, name="MMM"):
    image_list = sorted(set([img for pair in data.keys() for img in pair]))

    # Generate 2D list of scores.
    scores = []
    for img1 in image_list:
        row = []
        for img2 in image_list:
            if (img1, img2) in data:
                row.append(data[(img1, img2)])
            elif (img2, img1) in data:
                row.append(data[(img2, img1)])
            else:
                row.append(None)  # You may want to handle this case differently
        scores.append(row)

    # Create the heatmap.
    fig = go.Figure(data=go.Heatmap(
                    z=scores,
                    x=image_list,
                    y=image_list,
                    hoverongaps = False,
                    colorscale='Viridis'))

    titleText = f"Image Similarities for Category '{name[0]}'" if len(name) == 1 else f"Image Similarities for Category '{name[0]}' and Prompt '{name[1]}'"
    # Update the layout.
    fig.update_layout(
        title=titleText,
        xaxis_nticks=len(image_list),
        yaxis_nticks=len(image_list),
        xaxis_title="Image",
        yaxis_title="Image")

    fig.show()


def showHeatMap(data, name="MMM"):
    df = pd.DataFrame(list(data.items()), columns=['Images', 'Similarity'])

    # Split the tuple of images into two columns.
    df[['Image1', 'Image2']] = pd.DataFrame(df['Images'].tolist(), index=df.index)
    df = df.drop(columns=['Images'])

    # Pivot the DataFrame to create a matrix.
    pivot_table = df.pivot(index='Image1', columns='Image2', values='Similarity')

    # Plot a heatmap using Seaborn.
    plt.figure(figsize=(10, 8))
    sns.heatmap(pivot_table, cmap='viridis')

    if(len(name) == 1):
        plt.title(f"Image Similarities for Category '{name[0]}'")
    else:
        plt.title(f"Image Similarities for Category '{name[0]}' and Prompt '{name[1]}'")

    plt.show()

def saveHeatMap(data, name="MMM", showLabels=True):
    df = pd.DataFrame(list(data.items()), columns=['Images', 'Similarity'])
    # Split the tuple of images into two columns.
    df[['Image1', 'Image2']] = pd.DataFrame(df['Images'].tolist(), index=df.index)
    df = df.drop(columns=['Images'])

    # Pivot the DataFrame to create a matrix.
    pivot_table = df.pivot(index='Image1', columns='Image2', values='Similarity')

    # Plot a heatmap using Seaborn.
    if(not showLabels):
        plt.figure(figsize=(60,55))
    else:
        plt.figure(figsize=(25, 24))
    hm = sns.heatmap(pivot_table, cmap='viridis')
    if(not showLabels):
        hm.set_yticklabels([])
        hm.set_xticklabels([])
    if(len(name) == 1):
        plt.title(f"Image Similarities for Category '{name[0]}'")
        plt.savefig(f"heatmaps/{name[0]}.png")
    else:
        plt.title(f"Image Similarities for Category '{name[0]}' and Prompt '{name[1]}'")
        plt.savefig(f"heatmaps/{name[0]}_{name[1]}.png")

def getSorted(chosen_category, chosen_prompt):
    similarity_data = similarities[chosen_category][chosen_prompt]
    df = pd.DataFrame(list(similarity_data.items()), columns=['Images', 'Similarity'])

    # Split the tuple of images into two columns.
    df[['Image1', 'Image2']] = pd.DataFrame(df['Images'].tolist(), index=df.index)

    df = df[(df['Image1'] != df['Image2']) & (df['Image1'] < df['Image2'])]


    df = df.drop(columns=['Images'])

    # Pivot the DataFrame to create a matrix.
    # Flatten the DataFrame and sort by similarity.
    df_sorted = df.sort_values(by="Similarity", ascending=False)
    return df_sorted



categories = ["style", "perspective", "creativity", "beauty", "composition", "emotion"]
prompts = ['1', '2', '3', '4']

groupedSimilarities = {key: {imgs: score for prompt in value.values() for imgs, score in prompt.items()} for key, value in similarities.items()}



def save():
    for category in categories:
        saveHeatMap(groupedSimilarities[category], name=[category], showLabels=True)

    saveHeatMap(similarities["style"]["1"], name=['style', '1'])

save()

#plotlyShow(similarities["perspective"]['1'], name=["perspective"])
#plotlyShow(groupedSimilarities["emotion"], name=["emotion"])



