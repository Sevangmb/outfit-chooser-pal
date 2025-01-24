import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const colorNames: { [key: string]: string } = {
  "#FF0000": "Rouge",
  "#00FF00": "Vert",
  "#0000FF": "Bleu",
  "#FFFF00": "Jaune",
  "#FF00FF": "Magenta",
  "#00FFFF": "Cyan",
  "#000000": "Noir",
  "#FFFFFF": "Blanc",
  "#808080": "Gris",
  "#800000": "Bordeaux",
  "#808000": "Olive",
  "#008000": "Vert foncé",
  "#800080": "Violet",
  "#008080": "Turquoise",
  "#000080": "Bleu marine",
  "#FFA500": "Orange",
  "#A52A2A": "Marron",
  "#FFC0CB": "Rose",
  "#FFD700": "Or",
  "#C0C0C0": "Argent",
}

function findClosestColor(hex: string): string {
  try {
    console.log("Finding closest color for:", hex);
    let closestColor = "Noir";
    let minDistance = Number.MAX_VALUE;
    
    // Convert input hex to RGB
    const r1 = parseInt(hex.slice(1, 3), 16);
    const g1 = parseInt(hex.slice(3, 5), 16);
    const b1 = parseInt(hex.slice(5, 7), 16);
    
    for (const [colorHex, colorName] of Object.entries(colorNames)) {
      // Convert comparison hex to RGB
      const r2 = parseInt(colorHex.slice(1, 3), 16);
      const g2 = parseInt(colorHex.slice(3, 5), 16);
      const b2 = parseInt(colorHex.slice(5, 7), 16);
      
      // Calculate Euclidean distance
      const distance = Math.sqrt(
        Math.pow(r1 - r2, 2) + 
        Math.pow(g1 - g2, 2) + 
        Math.pow(b1 - b2, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorName;
      }
    }
    
    console.log("Found closest color:", closestColor);
    return closestColor;
  } catch (error) {
    console.error("Error finding closest color:", error);
    return "Inconnu";
  }
}

function generatePalette(hex: string): string[] {
  try {
    console.log("Generating palette for:", hex);
    // Convert hex to HSL
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    
    // Generate complementary colors
    const palette = [];
    
    // Analogous colors
    palette.push(hslToHex(((h + 1/12) % 1) * 360, s * 100, l * 100));
    palette.push(hslToHex(((h - 1/12) % 1) * 360, s * 100, l * 100));
    
    // Complementary color
    palette.push(hslToHex(((h + 0.5) % 1) * 360, s * 100, l * 100));
    
    // Triadic colors
    palette.push(hslToHex(((h + 1/3) % 1) * 360, s * 100, l * 100));
    palette.push(hslToHex(((h + 2/3) % 1) * 360, s * 100, l * 100));
    
    console.log("Generated palette:", palette);
    return palette;
  } catch (error) {
    console.error("Error generating palette:", error);
    return [];
  }
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request:", req.method);
    const requestData = await req.json();
    console.log("Request data:", requestData);

    if (!requestData || !requestData.hexColor) {
      throw new Error('Missing hexColor in request body');
    }

    const { hexColor } = requestData;
    
    if (!hexColor || !/^#[0-9A-F]{6}$/i.test(hexColor)) {
      throw new Error('Invalid hex color format');
    }

    const colorName = findClosestColor(hexColor);
    const palette = generatePalette(hexColor);

    const response = {
      colorName,
      palette,
    };

    console.log("Sending response:", response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})