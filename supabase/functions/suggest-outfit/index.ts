import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Loading suggest-outfit function...")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { temperature, weatherDescription, conditions } = await req.json()
    console.log("Received request with:", { temperature, weatherDescription, conditions })

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    let prompt = `En tant que conseiller vestimentaire, suggère une tenue appropriée pour aujourd'hui. 
    Conditions météo actuelles:
    - Température: ${temperature}°C
    - Description: ${weatherDescription}
    - Conditions spéciales: ${conditions.join(', ')}

    Donne une suggestion courte et précise qui tient compte de:
    - La température (vêtements chauds si froid, légers si chaud)
    - La pluie (imperméables si nécessaire)
    - La neige (vêtements chauds et imperméables si nécessaire)
    - Le style casual/décontracté

    Format souhaité: Une phrase concise en français qui liste les vêtements recommandés.`

    console.log("Sending prompt to Gemini:", prompt)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const suggestion = response.text()

    console.log("Received suggestion from Gemini:", suggestion)

    return new Response(
      JSON.stringify({ suggestion }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      },
    )
  } catch (error) {
    console.error("Error in suggest-outfit function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      },
    )
  }
})