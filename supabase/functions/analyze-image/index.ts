import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/microsoft/resnet-50"

// Mapping of common clothing terms to our categories
const categoryMappings: Record<string, string> = {
  // Hauts
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
  
  // Bas
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
  
  // Chaussures
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
  
  // Robes
  'dress': 'Robes',
  'gown': 'Robes',
  'robe': 'Robes',
  
  // Manteaux
  'coat': 'Manteaux',
  'jacket': 'Manteaux',
  'blazer': 'Manteaux',
  'manteau': 'Manteaux',
  'veste': 'Manteaux',
  
  // Accessoires
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

function detectCategory(label: string, imageRatio: number): string {
  // Convert to lowercase for case-insensitive matching
  const normalizedLabel = label.toLowerCase();
  console.log("Analyzing label:", normalizedLabel);
  
  // Check each word in the label against our mappings
  const words = normalizedLabel.split(/[\s,]+/);
  for (const word of words) {
    if (categoryMappings[word]) {
      console.log(`Detected category '${categoryMappings[word]}' from word '${word}'`);
      return categoryMappings[word];
    }
  }
  
  // If no specific word match, use image proportions as a fallback
  console.log("No category detected from words, using image ratio:", imageRatio);
  
  // Use image proportions to help determine category
  if (imageRatio > 1.3) { // Wide image
    console.log("Wide image ratio detected - likely Chaussures");
    return "Chaussures";
  } else if (imageRatio < 0.7) { // Tall image
    console.log("Tall image ratio detected - likely Bas");
    return "Bas";
  } else if (imageRatio >= 0.7 && imageRatio <= 1.3) { // Square-ish image
    console.log("Square-ish image ratio detected - likely Hauts");
    return "Hauts";
  }
  
  // Default fallback
  console.log("No specific category detected, defaulting to Hauts");
  return "Hauts";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    console.log("Received image data for analysis");

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Remove the data URL prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob from Uint8Array
    const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
    console.log("Image blob created, size:", imageBlob.size);

    // Calculate image ratio
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    const imageRatio = img.width / img.height;
    console.log("Image ratio calculated:", imageRatio);

    // Send image to Hugging Face API
    const response = await fetch(HUGGING_FACE_API_URL, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGING_FACE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: imageBlob
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`Hugging Face API error: ${response.statusText || 'Unknown error'}`);
    }

    const results = await response.json();
    console.log("Classification results:", results);

    // Get the most likely label
    const topResult = results[0];
    let detectedName = "";

    if (topResult) {
      // Extract name from the label
      detectedName = topResult.label
        .split(',')[0] // Take first part before comma
        .split(' ')[0] // Take first word
        .toLowerCase(); // Convert to lowercase
      
      // Detect category based on both the label and image ratio
      const category = detectCategory(topResult.label, imageRatio);
      
      return new Response(
        JSON.stringify({ 
          name: detectedName,
          category: category,
          confidence: topResult.score || 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        name: "",
        category: "Hauts",
        confidence: 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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