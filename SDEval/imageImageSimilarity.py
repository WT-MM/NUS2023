import pickle
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

import plotly.graph_objects as go

from collections import defaultdict


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

def modelSimilarity(data):
    # Initialize a dictionary to store aggregate similarities for each model pair.
    model_similarities = defaultdict(float)
    model_counts = defaultdict(int)

    # Aggregate the similarities.
    for (img1, img2), score in data.items():
        # Extract model names.
        model1 = img1.split('_')[0]
        model2 = img2.split('_')[0]
        
        # Update the aggregate similarity and count for the model pair.
        model_similarities[(model1, model2)] += score
        model_counts[(model1, model2)] += 1

    # Compute the average similarity for each model pair.
    average_similarities = {model_pair: total_score / model_counts[model_pair] for model_pair, total_score in model_similarities.items()}
    return average_similarities

def similarModels(target_model, data):
    average_similarities = modelSimilarity(data)
    # Select pairs that involve the target model and sort them by similarity.
    sorted_pairs = sorted(
        {(model1 if model2 == target_model else model2, score)
         for (model1, model2), score in average_similarities.items()
         if target_model == model1},
        key=lambda x: x[1],  # Sort by score.
        reverse=True  # Sort in descending order.
    )
    
    # Return the models.
    return sorted_pairs

def plotSimilarModels(target_model, data, save=False):
    model_similarities = similarModels(target_model, data)
    models = [model for model, _ in model_similarities]
    similarities = [similarity for _, similarity in model_similarities]

    # Create a bar chart.
    fig = go.Figure(data=go.Bar(
        x=models,
        y=similarities,
    ))

    # Update the layout.
    fig.update_layout(
        title=f'Similarities to {target_model}',
        xaxis_title='Model',
        yaxis_title='Similarity',
    )
    if(save):
        fig.write_image(f"output/{target_model}_similarities.png")
    else:
        fig.show()



def showSimilarityPairs(data):
    average_similarities = modelSimilarity(data)
    models = sorted(set(model for pair in average_similarities.keys() for model in pair))  # Get a list of unique models.
    similarity_matrix = [[average_similarities.get((model1, model2), None) or average_similarities.get((model2, model1), None) for model2 in models] for model1 in models]

    # Create a heatmap.
    fig = go.Figure(data=go.Heatmap(
        z=similarity_matrix,
        x=models,
        y=models,
        hoverongaps = False,
        colorscale='Viridis'))

    # Update the layout.
    fig.update_layout(
        title=f'Average Similarities Between Models',
        xaxis_title='Model',
        yaxis_title='Model',
    )



    fig.show()


categories = ["style", "perspective", "creativity", "beauty", "composition", "emotion"]
prompts = ['1', '2', '3', '4']
models = ['sdxl', 'openjourney', 'sd2.1', 'sd1.5', 'dreamshaper', 'realisticvision', 'deliberate', 'dalle2']

groupedSimilarities = {key: {imgs: score for prompt in value.values() for imgs, score in prompt.items()} for key, value in similarities.items()}

bigGroupedSimilarities = {imgs: score for prompt in groupedSimilarities.values() for imgs, score in prompt.items()}

def save():
    for category in categories:
        saveHeatMap(groupedSimilarities[category], name=[category], showLabels=True)

    saveHeatMap(similarities["style"]["1"], name=['style', '1'])

#save()

#plotlyShow(similarities["perspective"]['1'], name=["perspective"])
#plotlyShow(groupedSimilarities["emotion"], name=["emotion"])


modelSimilarity(similarities["style"]["1"])

#showSimilarityPairs(similarities["style"]["1"])
#showSimilarityPairs(bigGroupedSimilarities)

#print(similarModels("sdxl", bigGroupedSimilarities))

#showSimilarityPairs(bigGroupedSimilarities)


for thing in groupedSimilarities.values():
    plotlyShow(thing, name=["style"])

#for model in models:
#    plotSimilarModels(model, bigGroupedSimilarities, save=True)