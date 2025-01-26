import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from 'npm:googleapis';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Testing Google Drive connection...");

    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/auth/callback'
    );

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Test creating a folder
    const testFolder = await drive.files.create({
      requestBody: {
        name: 'Test Folder',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name, webViewLink',
    });

    console.log("Test folder created successfully:", testFolder.data);

    // Clean up by deleting the test folder
    if (testFolder.data.id) {
      await drive.files.delete({
        fileId: testFolder.data.id
      });
      console.log("Test folder cleaned up successfully");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Connection to Google Drive successful",
        testDetails: testFolder.data
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error testing Google Drive connection:", error);
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