export const analyzeImage = async (imageUrl: string): Promise<{ category?: string } | null> => {
  try {
    // Chargement de l'image
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Pour l'instant, on simule une détection basique basée sur les proportions de l'image
    const ratio = img.width / img.height;
    
    if (ratio > 1.5) {
      return { category: "Chaussures" };
    } else if (ratio < 0.7) {
      return { category: "Pantalon" };
    } else {
      return { category: "T-shirt" };
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
};

export const extractDominantColor = async (imageUrl: string): Promise<string | null> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;

    // On calcule la moyenne des couleurs
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    // Conversion en hexadécimal
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    console.log('Extracted color:', hex);
    return hex;

  } catch (error) {
    console.error("Error extracting dominant color:", error);
    return null;
  }
};