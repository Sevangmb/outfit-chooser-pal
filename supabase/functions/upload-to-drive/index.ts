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
    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/auth/callback'
    );

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file provided');
    }

    const buffer = await file.arrayBuffer();
    const fileMetadata = {
      name: file.name,
      mimeType: file.type,
    };

    const media = {
      mimeType: file.type,
      body: new Uint8Array(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink',
    });

    console.log('File uploaded successfully:', response.data);

    return new Response(
      JSON.stringify({
        success: true,
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error uploading file:', error);
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