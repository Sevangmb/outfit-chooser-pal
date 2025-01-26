import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    console.log("Starting OCR analysis");
    
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_API_KEY'));
    
    // Use Microsoft's TrOCR model which is more reliable for text detection
    const result = await hf.textGeneration({
      model: 'microsoft/trocr-base-printed',
      inputs: imageBase64,
    });

    console.log("OCR analysis completed:", result);

    // Extract relevant information
    const text = result.generated_text.toLowerCase();
    const info = {
      brand: extractBrand(text),
      size: extractSize(text),
      material: extractMaterial(text)
    };

    console.log("Extracted information:", info);

    return new Response(
      JSON.stringify(info),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-label function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function extractBrand(text: string): string | null {
  const brandPatterns = [
    /brand:\s*([^\n]+)/i,
    /marque:\s*([^\n]+)/i,
    /by\s+([a-z&\s]+)/i,
    /([a-z]+)\s+collection/i
  ];

  for (const pattern of brandPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractSize(text: string): string | null {
  const sizePatterns = [
    /size:\s*([^\n]+)/i,
    /taille:\s*([^\n]+)/i,
    /\b(xs|s|m|l|xl|xxl|xxxl)\b/i,
    /\b(3[4-9]|4[0-9]|5[0-2])\b/
  ];

  for (const pattern of sizePatterns) {
    const match = text.match(pattern);
    if (match?.[1] || match?.[0]) {
      return (match[1] || match[0]).trim().toUpperCase();
    }
  }
  return null;
}

function extractMaterial(text: string): string | null {
  const materialPatterns = [
    /material:\s*([^\n]+)/i,
    /matière:\s*([^\n]+)/i,
    /composition:\s*([^\n]+)/i,
    /\b(cotton|coton|polyester|wool|laine|silk|soie|linen|lin|viscose|elastane|élasthanne)\b/i
  ];

  for (const pattern of materialPatterns) {
    const match = text.match(pattern);
    if (match?.[1] || match?.[0]) {
      return (match[1] || match[0]).trim();
    }
  }
  return null;
}