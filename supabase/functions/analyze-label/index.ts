import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const extractLabelInfo = (text: string) => {
  console.log("Extracting info from text:", text);
  
  const info = {
    brand: "",
    size: "",
    material: "",
  };

  // Common brand patterns
  const brandPatterns = [
    /marque\s*:\s*([^\n]+)/i,
    /brand\s*:\s*([^\n]+)/i,
    /([A-Z][A-Za-z\s&]+)(?=\s+size|\s+taille)/,
  ];

  // Size patterns
  const sizePatterns = [
    /taille\s*:\s*([^\n]+)/i,
    /size\s*:\s*([^\n]+)/i,
    /\b(XS|S|M|L|XL|XXL|XXXL)\b/,
    /\b(3[4-9]|4[0-9]|5[0-2])\b/,
  ];

  // Material patterns
  const materialPatterns = [
    /matière\s*:\s*([^\n]+)/i,
    /composition\s*:\s*([^\n]+)/i,
    /material\s*:\s*([^\n]+)/i,
    /\b(coton|cotton|polyester|laine|wool|soie|silk|lin|linen|viscose|elasthanne|élasthanne)\b/i,
  ];

  // Extract brand
  for (const pattern of brandPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.brand = match[1]?.trim() || match[0]?.trim() || "";
      break;
    }
  }

  // Extract size
  for (const pattern of sizePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.size = match[1]?.trim() || match[0]?.trim() || "";
      break;
    }
  }

  // Extract material
  for (const pattern of materialPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.material = match[1]?.trim() || match[0]?.trim() || "";
      break;
    }
  }

  console.log("Extracted info:", info);
  return info;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    console.log("Received image for OCR analysis");

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_API_KEY'));
    
    // Use Microsoft's Donut model for OCR
    const result = await hf.textGeneration({
      model: 'microsoft/donut-base-finetuned-cord-v2',
      inputs: imageBase64,
    });

    console.log("OCR result:", result);

    const extractedInfo = extractLabelInfo(result.generated_text);

    return new Response(
      JSON.stringify(extractedInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});