# Same format as webapp viewer but generates a static html file
from retrieve import Retrieve
from bs4 import BeautifulSoup
from base64 import b64encode


def encodedImages():
    images = Retrieve('../input/view',rootLevel=True).findImgs(shuffle=False)
    b64Images = []
    for i in images:
        with open(i, "rb") as f:
            b64Images.append('data:image/png;base64,'+b64encode(f.read()).decode('utf-8'))
    return b64Images

def imageData(dataIndices):
    images = [filePath.split('\\')[-1] for filePath in Retrieve('../input/view',rootLevel=True).findImgs(shuffle=False)]
    relevantData = []
    for i in images:
        split = i[:-3].split("_")
        relevantData.append([split[j] for j in dataIndices])
    return relevantData


def generateHTML(dataIndices=[0,1,2], dataLabels=['Model', 'Style', 'Prompt']):
    template = BeautifulSoup(open("template.html"), "html.parser")
    imageContainer = template.find(id='imageContainer')
    
    overlayData = imageData(dataIndices)

    # Create the main div element
    imageGrid = template.new_tag('div')
    imageGrid['class'] = 'image-container'

    encodedImgs = encodedImages()

    # Iterate over the encoded images list
    for i in range(len(encodedImgs)):
        image = encodedImgs[i]
        # Create the image wrapper div element
        imageWrapper = template.new_tag('div')
        imageWrapper['class'] = 'image'

        # Create the img element
        imgElement = template.new_tag('img')
        imgElement['src'] = image

        # Create the overlay div element
        overlayElement = template.new_tag('div')
        overlayElement['class'] = 'image-overlay'
        overlayElement.string = str({label: overlayData[i][j] for j, label in zip(dataIndices, dataLabels)})

        # Append the img element and overlay element to the image wrapper
        imageWrapper.append(imgElement)
        imageWrapper.append(overlayElement)

        # Append the image wrapper to the main imageGrid div
        imageGrid.append(imageWrapper)

    # Append the imageGrid div to the imageContainer
    imageContainer.append(imageGrid)

    # Write the html to a file
    with open('output.html', 'w') as f:
        f.write(str(template))

def stepsEval():
    generateHTML(dataIndices=[0,1,2,3], dataLabels=['Model', 'Style', 'Prompt', 'Steps'])

if __name__ == '__main__':
    stepsEval()