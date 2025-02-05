import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Loading suggest-outfit function...")

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryWithDelay(fn: () => Promise<any>, retries: number = MAX_RETRIES): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${MAX_RETRIES - retries + 1} attempt`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryWithDelay(fn, retries - 1);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { temperature, weatherDescription, conditions } = await req.json()
    console.log("Received request with:", { temperature, weatherDescription, conditions })

    // Get the user ID from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("Authorization header is required")
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get user ID from JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      console.error("Error getting user:", userError)
      throw new Error("Failed to authenticate user")
    }

    console.log("Authenticated user:", user.id)

    // Fetch user's clothes
    const { data: clothes, error: clothesError } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)

    if (clothesError) {
      console.error("Error fetching clothes:", clothesError)
      throw new Error("Failed to fetch user's clothes")
    }

    if (!clothes || clothes.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestion: "Désolé, je ne trouve pas de vêtements dans votre garde-robe pour faire une suggestion." 
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    console.log("Found", clothes.length, "items in wardrobe")

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

    // Check if we have enough clothes to make a suggestion
    if (tops.length === 0 || bottoms.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestion: "Je ne trouve pas assez de vêtements différents pour faire une suggestion complète. Il me faut au minimum un haut et un bas." 
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    // Prepare wardrobe description for AI
    const wardrobeDescription = `
    Hauts disponibles: ${tops.map(t => `${t.name} (${t.color})`).join(', ')}
    Bas disponibles: ${bottoms.map(b => `${b.name} (${b.color})`).join(', ')}
    ${outerwear.length > 0 ? `Vestes/Manteaux disponibles: ${outerwear.map(o => `${o.name} (${o.color})`).join(', ')}` : ''}
    ${shoes.length > 0 ? `Chaussures disponibles: ${shoes.map(s => `${s.name} (${s.color})`).join(', ')}` : ''}
    `

    console.log("Wardrobe description:", wardrobeDescription)

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `En tant que conseiller vestimentaire, suggère une tenue appropriée pour aujourd'hui en utilisant uniquement les vêtements disponibles dans la garde-robe. 

    Conditions météo actuelles:
    - Température: ${temperature}°C
    - Description: ${weatherDescription}
    - Conditions spéciales: ${conditions?.join(', ') || 'Aucune'}

    Garde-robe disponible:
    ${wardrobeDescription}

    Règles importantes pour la suggestion:
    1. Utilise uniquement les vêtements listés ci-dessus
    2. Si il pleut, privilégie les vêtements imperméables ou adaptés à la pluie
    3. Si il fait froid (<15°C), suggère des vêtements chauds et des couches
    4. Si il fait très froid (<5°C), inclus absolument un manteau chaud
    5. Si il fait chaud (>25°C), suggère des vêtements légers et respirants
    6. Crée une combinaison harmonieuse de couleurs
    
    Format souhaité: Une phrase concise en français qui liste les vêtements spécifiques recommandés.`

    console.log("Sending prompt to Gemini:", prompt)

    // Use the retry mechanism for the Gemini API call
    const result = await retryWithDelay(async () => {
      const response = await model.generateContent(prompt)
      return response.response
    });

    const suggestion = result.text()
    console.log("Received suggestion from Gemini:", suggestion)

    return new Response(
      JSON.stringify({ suggestion }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    )
  } catch (error) {
    console.error("Error in suggest-outfit function:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur est survenue lors de la génération de la suggestion",
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    )
  }
})