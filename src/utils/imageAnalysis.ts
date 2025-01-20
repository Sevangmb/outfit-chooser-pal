import { pipeline } from '@huggingface/transformers';

interface ImageClassificationResult {
  label: string;
  score: number;
}

export const analyzeImage = async (imageUrl: string) => {
  try {
    console.log('Starting image analysis...');
    
    // Initialize the image classification pipeline with a compatible model
    const classifier = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');

    // Analyze the image
    console.log('Analyzing image:', imageUrl);
    const results = await classifier(imageUrl);
    console.log('Classification results:', results);

    // Get the most likely category
    const topResult = Array.isArray(results) ? results[0] : results;
    const label = (topResult as ImageClassificationResult).label?.toLowerCase() || '';

    // Map the model's category to our application's categories
    const categoryMapping: Record<string, string> = {
      'dress': 'Robe',
      'shirt': 'Haut',
      'pants': 'Pantalon',
      't-shirt': 'Haut',
      'jacket': 'Veste',
      'coat': 'Manteau',
      'shoe': 'Chaussures',
      'sneaker': 'Chaussures',
      'suit': 'Costume',
      'tie': 'Accessoire',
      'sandal': 'Chaussures',
      'boot': 'Chaussures',
      'blouse': 'Haut',
      'sweater': 'Haut',
      'hoodie': 'Haut',
      'skirt': 'Jupe',
      'shorts': 'Pantalon',
      'jeans': 'Pantalon',
    };

    return {
      category: categoryMapping[label] || '',
      confidence: (topResult as ImageClassificationResult).score || 0,
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
};

export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image onto canvas
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate the average color
    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    // Calculate average values
    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    // Convert to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch (error) {
    console.error('Error extracting dominant color:', error);
    return '#000000';
  }
};