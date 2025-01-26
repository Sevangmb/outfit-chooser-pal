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
      console.error("Microsoft credentials not configured");
      throw new Error('Microsoft credentials not configured')
    }

    // Get access token using client credentials flow
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

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Failed to get access token:", tokenData);
      throw new Error('Failed to get access token: ' + (tokenData.error_description || tokenData.error || 'Unknown error'));
    }

    // Test Graph API connection
    console.log("Testing Graph API connection...");
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!graphResponse.ok) {
      const errorText = await graphResponse.text();
      console.error("Graph API test failed:", errorText);
      throw new Error('Failed to connect to OneDrive: ' + errorText);
    }

    const graphData = await graphResponse.json();
    console.log("Graph API connection successful:", graphData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully connected to OneDrive",
        details: {
          driveId: graphData.id,
          driveName: graphData.name,
          webUrl: graphData.webUrl
        }
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
        error: error.message || 'An unexpected error occurred'
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