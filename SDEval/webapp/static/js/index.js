function displayImages() {
  const selector1 = document.getElementById('category').value;
  const selector2 = document.getElementById('prompt').value;

  const imageContainer = document.getElementById('imageContainer');
  imageContainer.innerHTML = '';

  // Update prompt
  const prompt = document.getElementById('promptText');
  prompt.innerHTML = promptLookup[selector1][selector2]

  const filteredImages = images.filter(
    (image) =>
      image.category === selector1 && image.prompt === selector2
  );

  const imageGrid = document.createElement('div');
  imageGrid.className = 'image-container';

  filteredImages.forEach((image) => {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image';

    const imgElement = document.createElement('img');
    imgElement.src = image.src;
    imgElement.alt = image.category;

    const overlayElement = document.createElement('div');
    overlayElement.className = 'image-overlay';
    overlayElement.textContent = image.model;

    imageWrapper.appendChild(imgElement);
    imageWrapper.appendChild(overlayElement);
    imageGrid.appendChild(imageWrapper);
  });

  imageContainer.appendChild(imageGrid);
}

// Add event listeners for select element changes
document.getElementById('category').addEventListener('change', displayImages);
document.getElementById('prompt').addEventListener('change', displayImages);

// Initial display
displayImages();