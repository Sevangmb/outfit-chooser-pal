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
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')
    const tenantId = 'common'

    if (!clientId || !clientSecret) {
      console.error("Missing Microsoft credentials")
      throw new Error('Microsoft credentials not configured')
    }

    console.log("Starting OneDrive connection test...")
    console.log("Using client ID:", clientId.substring(0, 8) + "...")
    
    // Get access token using client credentials flow
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const scope = 'https://graph.microsoft.com/.default'
    
    console.log("Requesting token from:", tokenUrl)
    
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: scope
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Token request failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenData
      });
      throw new Error(`Failed to get access token: ${tokenData.error_description || 'Unknown error'}`);
    }

    if (!tokenData.access_token) {
      console.error("No access token in response:", tokenData);
      throw new Error('No access token received');
    }

    console.log("Access token obtained successfully");

    // Test Microsoft Graph API connection
    const graphUrl = 'https://graph.microsoft.com/v1.0/me/drive';
    console.log("Testing Graph API connection to:", graphUrl);

    const graphResponse = await fetch(graphUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!graphResponse.ok) {
      const graphError = await graphResponse.json();
      console.error("Graph API request failed:", {
        status: graphResponse.status,
        statusText: graphResponse.statusText,
        error: graphError
      });
      throw new Error(`Graph API connection failed: ${JSON.stringify(graphError)}`);
    }

    const graphData = await graphResponse.json();
    console.log("Successfully connected to OneDrive:", {
      driveId: graphData.id,
      driveName: graphData.name
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully connected to OneDrive',
        drive: graphData
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Connection test failed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});