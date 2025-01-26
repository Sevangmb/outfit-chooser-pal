import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
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
    const { temperature, weatherDescription, conditions, userId, clothes } = await req.json()
    console.log("Received request with:", { temperature, weatherDescription, conditions, userId })
    console.log("User's wardrobe:", clothes.length, "items")

    // Organize clothes by category
    const tops = clothes.filter(item => 
      item.category.toLowerCase().includes('haut') || 
      item.category.toLowerCase().includes('t-shirt') ||
      item.category.toLowerCase().includes('chemise') ||
      item.category.toLowerCase().includes('pull')
    )

    const bottoms = clothes.filter(item => 
      item.category.toLowerCase().includes('bas') || 
      item.category.toLowerCase().includes('pantalon') ||
      item.category.toLowerCase().includes('jean') ||
      item.category.toLowerCase().includes('short')
    )

    const outerwear = clothes.filter(item =>
      item.category.toLowerCase().includes('manteau') ||
      item.category.toLowerCase().includes('veste') ||
      item.category.toLowerCase().includes('blouson')
    )

    const shoes = clothes.filter(item => 
      item.category.toLowerCase().includes('chaussure') || 
      item.category.toLowerCase().includes('basket') ||
      item.category.toLowerCase().includes('botte')
    )

    // Prepare wardrobe description for AI
    const wardrobeDescription = `
    Hauts disponibles: ${tops.map(t => `${t.name} (${t.color})`).join(', ')}
    Bas disponibles: ${bottoms.map(b => `${b.name} (${b.color})`).join(', ')}
    Vestes/Manteaux disponibles: ${outerwear.map(o => `${o.name} (${o.color})`).join(', ')}
    Chaussures disponibles: ${shoes.map(s => `${s.name} (${s.color})`).join(', ')}
    `

    console.log("Wardrobe description:", wardrobeDescription)

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    let prompt = `En tant que conseiller vestimentaire, suggère une tenue appropriée pour aujourd'hui en utilisant uniquement les vêtements disponibles dans la garde-robe. 

    Conditions météo actuelles:
    - Température: ${temperature}°C
    - Description: ${weatherDescription}
    - Conditions spéciales: ${conditions.join(', ')}

    Garde-robe disponible:
    ${wardrobeDescription}

    Donne une suggestion précise qui:
    1. Utilise uniquement les vêtements listés ci-dessus
    2. Tient compte de la température et des conditions météo
    3. Crée une combinaison harmonieuse de couleurs
    4. Si la température est inférieure à 15°C, inclure un vêtement chaud
    5. Si la température est inférieure à 5°C, inclure un manteau
    
    Format souhaité: Une phrase concise en français qui liste les vêtements spécifiques recommandés.`

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