import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from 'npm:googleapis';
import { createClient } from './supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get user information from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user information from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Failed to get user information');
    }

    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/auth/callback'
    );

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file provided');
    }

    console.log("Processing file upload:", file.name);

    // Check if user folder exists, create if not
    let folderId;
    const folderName = `user_${user.id}`;
    const folderResponse = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id)',
    });

    if (folderResponse.data.files && folderResponse.data.files.length > 0) {
      folderId = folderResponse.data.files[0].id;
      console.log("Using existing folder:", folderId);
    } else {
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = folder.data.id;
      console.log("Created new folder:", folderId);
    }

    const buffer = await file.arrayBuffer();
    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };

    console.log("Uploading file to Google Drive...");
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: new Uint8Array(buffer),
      },
      fields: 'id,webViewLink',
    });

    console.log("Upload successful:", response.data);

    // Store file metadata in Supabase
    const { error: dbError } = await supabaseClient
      .from('user_files')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: response.data.webViewLink,
        content_type: file.type,
        size: file.size,
        description: `Uploaded to Google Drive folder: ${folderName}`,
      });

    if (dbError) {
      console.error("Error storing file metadata:", dbError);
      throw dbError;
    }

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