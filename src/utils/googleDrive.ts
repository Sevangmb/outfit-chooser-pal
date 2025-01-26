import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  'http://localhost:3000/auth/callback' // À ajuster selon votre URL de callback
);

export const drive = google.drive({ version: 'v3', auth: oauth2Client });