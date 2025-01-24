import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/microsoft/resnet-50"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()
    console.log("Received image data for analysis")

    if (!imageBase64) {
      throw new Error('No image data provided')
    }

    // Remove the data URL prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Create blob from Uint8Array
    const imageBlob = new Blob([bytes], { type: 'image/jpeg' })
    console.log("Image blob created, size:", imageBlob.size)

    // Send image to Hugging Face API with proper headers and error handling
    const response = await fetch(HUGGING_FACE_API_URL, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGING_FACE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: imageBlob
    })

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      throw new Error(`Hugging Face API error: ${response.statusText || 'Unknown error'}`)
    }

    const results = await response.json()
    console.log("Classification results:", results)

    // Get the most likely label
    const topResult = results[0]
    let detectedName = ""

    if (topResult) {
      detectedName = topResult.label
        .split(',')[0] // Take first part before comma
        .split(' ')[0] // Take first word
        .toLowerCase() // Convert to lowercase
    }

    return new Response(
      JSON.stringify({ 
        name: detectedName,
        confidence: topResult?.score || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})