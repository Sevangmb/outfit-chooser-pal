import { supabase } from "@/integrations/supabase/client";

const getBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeImage = async (imageUrl: string): Promise<{ category?: string, name?: string, subcategory?: string } | null> => {
  try {
    console.log("Starting image analysis for:", imageUrl);
    
    // Convert image to base64
    const imageBase64 = await getBase64FromUrl(imageUrl);

    // Call Edge Function with base64 data
    const { data: analysisData, error } = await supabase.functions.invoke('analyze-image', {
      body: { imageBase64 }
    });

    if (error) {
      console.error("Error calling analyze-image function:", error);
      throw error;
    }

    console.log("Analysis results:", analysisData);

    // Map detected clothing name to subcategory for tops
    let subcategory = null;
    if (analysisData?.category === "Hauts") {
      const name = analysisData.name?.toLowerCase() || "";
      if (name.includes("t-shirt") || name.includes("tshirt") || name.includes("tee")) {
        subcategory = "T-shirt";
      } else if (name.includes("chemise") || name.includes("shirt") && !name.includes("t-shirt")) {
        subcategory = "Chemise";
      } else if (name.includes("pull") || name.includes("sweater") || name.includes("sweatshirt")) {
        subcategory = "Pull";
      }
    }

    return { 
      category: analysisData?.category,
      name: analysisData?.name,
      subcategory 
    };
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
