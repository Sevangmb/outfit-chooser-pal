import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const categoryMappings: Record<string, string> = {
  'shirt': 'Hauts',
  'tshirt': 'Hauts',
  't-shirt': 'Hauts',
  'sweater': 'Hauts',
  'hoodie': 'Hauts',
  'blouse': 'Hauts',
  'top': 'Hauts',
  'pull': 'Hauts',
  'chemise': 'Hauts',
  'polo': 'Hauts',
  'sweatshirt': 'Hauts',
  'tank': 'Hauts',
  'jersey': 'Hauts',
  'maillot': 'Hauts',
  
  'pants': 'Bas',
  'jeans': 'Bas',
  'shorts': 'Bas',
  'skirt': 'Bas',
  'trousers': 'Bas',
  'pantalon': 'Bas',
  'jean': 'Bas',
  'legging': 'Bas',
  'jogger': 'Bas',
  'culotte': 'Bas',
  'bermuda': 'Bas',
  
  'shoes': 'Chaussures',
  'sneakers': 'Chaussures',
  'boots': 'Chaussures',
  'sandals': 'Chaussures',
  'running': 'Chaussures',
  'chaussures': 'Chaussures',
  'basket': 'Chaussures',
  'tennis': 'Chaussures',
  'footwear': 'Chaussures',
  'shoe': 'Chaussures',
  'trainer': 'Chaussures',
  'boot': 'Chaussures',
  'sandal': 'Chaussures',
  'slipper': 'Chaussures',
  'mocassin': 'Chaussures',
  'espadrille': 'Chaussures',
  
  'dress': 'Robes',
  'gown': 'Robes',
  'robe': 'Robes',
  
  'coat': 'Manteaux',
  'jacket': 'Manteaux',
  'blazer': 'Manteaux',
  'manteau': 'Manteaux',
  'veste': 'Manteaux',
  
  'hat': 'Accessoires',
  'cap': 'Accessoires',
  'scarf': 'Accessoires',
  'belt': 'Accessoires',
  'accessory': 'Accessoires',
  'accessories': 'Accessoires',
  'chapeau': 'Accessoires',
  'casquette': 'Accessoires',
  'écharpe': 'Accessoires',
  'ceinture': 'Accessoires'
}

async function getImageDimensions(base64Data: string): Promise<{ width: number; height: number }> {
  try {
    console.log("Getting image dimensions");
    const base64Image = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;

    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    
    let offset = 2;
    while (offset < view.byteLength) {
      if (view.getUint8(offset) === 0xFF && view.getUint8(offset + 1) === 0xC0) {
        const height = view.getUint16(offset + 5);
        const width = view.getUint16(offset + 7);
        console.log("Found dimensions:", { width, height });
        return { width, height };
      }
      offset += 1;
    }
    
    console.log("Could not read image dimensions, using defaults");
    return { width: 800, height: 800 };
  } catch (error) {
    console.error("Error getting image dimensions:", error);
    return { width: 800, height: 800 };
  }
}

function detectCategory(label: string, imageRatio: number): string {
  console.log("Detecting category for label:", label, "with ratio:", imageRatio);
  const normalizedLabel = label.toLowerCase();
  
  const words = normalizedLabel.split(/[\s,]+/);
  for (const word of words) {
    if (categoryMappings[word]) {
      console.log(`Detected category '${categoryMappings[word]}' from word '${word}'`);
      return categoryMappings[word];
    }
  }
  
  return fallbackCategoryFromRatio(imageRatio);
}

function fallbackCategoryFromRatio(imageRatio: number): string {
  console.log("Using fallback category detection with ratio:", imageRatio);
  
  if (imageRatio > 1.3) {
    return "Chaussures";
  } else if (imageRatio < 0.7) {
    return "Bas";
  } else {
    return "Hauts";
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received image analysis request");
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const dimensions = await getImageDimensions(imageBase64);
    const imageRatio = dimensions.width / dimensions.height;
    console.log("Image ratio calculated:", imageRatio);

    try {
      console.log("Preparing image for Hugging Face API");
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
      console.log("Image blob created, size:", imageBlob.size);

      const apiKey = Deno.env.get('HUGGING_FACE_API_KEY');
      if (!apiKey) {
        throw new Error('Hugging Face API key not configured');
      }

      console.log("Calling Hugging Face API");
      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/resnet-50",
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: imageBlob
        }
      );

      if (!response.ok) {
        console.error('Hugging Face API error:', response.status, response.statusText);
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const results = await response.json();
      console.log("Classification results:", results);

      const topResult = results[0];
      if (!topResult) {
        throw new Error('No classification results received');
      }

      const detectedName = topResult.label
        .split(',')[0]
        .split(' ')[0]
        .toLowerCase();
      
      const category = detectCategory(topResult.label, imageRatio);
      
      const result = {
        name: detectedName,
        category: category,
        confidence: topResult.score || 0
      };

      console.log("Sending successful response:", result);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('API or processing error:', apiError);
      // Fallback to using image ratio only
      const fallbackCategory = fallbackCategoryFromRatio(imageRatio);
      const fallbackResult = {
        name: "",
        category: fallbackCategory,
        confidence: 0,
        note: "Used fallback detection due to API error"
      };

      console.log("Sending fallback response:", fallbackResult);
      return new Response(
        JSON.stringify(fallbackResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
