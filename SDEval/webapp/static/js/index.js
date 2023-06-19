const images = [
    { src: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg', style: 'category1' },
    { src: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg', style: 'category1' },
    { src: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg', style: 'category2' },
    { src: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg', style: 'category2' },
  ];



function displayImages() {
    const selector1 = document.getElementById('selector1').value;
    const selector2 = document.getElementById('selector2').value;
  
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';
  
    const filteredImages = images.filter(
      (image) =>
        image.category === selector1 && image.category === selector2
    );
  
    const imageGrid = document.createElement('div');
    imageGrid.className = 'image-container';
  
    filteredImages.forEach((image) => {
      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.className = 'image';
      imageGrid.appendChild(imgElement);
    });
  
    imageContainer.appendChild(imageGrid);
  }
  
// Add event listeners for select element changes
document.getElementById('selector1').addEventListener('change', displayImages);
document.getElementById('selector2').addEventListener('change', displayImages);
  
// Initial display
displayImages();