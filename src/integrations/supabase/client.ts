import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bjydiorocaixosezpylh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeWRpb3JvY2FpeG9zZXpweWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Njk1MzYsImV4cCI6MjA1MjQ0NTUzNn0.6tXBsBOaki8CByfj_km-1_Jwv9xoRsi3CCcGiMFa568";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing in environment variables.");
  throw new Error("Supabase configuration error.");
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
);