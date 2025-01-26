import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Testing OneDrive connection...");
    
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')
    const tenantId = 'common' // Using common endpoint for multi-tenant apps

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft credentials not configured')
    }

    // Test authentication with Microsoft Graph API
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const scope = 'https://graph.microsoft.com/.default'
    
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: scope
    })

    console.log("Requesting access token...");
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    const tokenData = await tokenResponse.json();
    console.log("Token response received");

    if (!tokenData.access_token) {
      console.error("Failed to get access token:", tokenData);
      throw new Error('Failed to get access token');
    }

    // Test Graph API connection
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!graphResponse.ok) {
      console.error("Graph API test failed:", await graphResponse.text());
      throw new Error('Failed to connect to OneDrive');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully connected to OneDrive"
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error testing OneDrive connection:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});