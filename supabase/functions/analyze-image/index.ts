import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/microsoft/resnet-50";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    console.log("Analyzing image:", imageUrl);

    // Fetch the image data
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

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
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const results = await response.json();
    console.log("Classification results:", results);

    // Get the most likely label
    const topResult = results[0];
    let detectedName = "";

    if (topResult) {
      detectedName = topResult.label
        .split(',')[0] // Take first part before comma
        .split(' ')[0] // Take first word
        .toLowerCase(); // Convert to lowercase
    }

    return new Response(JSON.stringify({ 
      name: detectedName,
      confidence: topResult?.score || 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});