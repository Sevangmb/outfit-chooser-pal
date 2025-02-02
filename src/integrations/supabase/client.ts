import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing in environment variables.");
  throw new Error("Supabase configuration error.");
}

console.log("Initializing Supabase client...");
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

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    console.log("User signed out or deleted.");
  } else if (event === 'SIGNED_IN' && !session) {
    console.error("Authentication error: Invalid credentials.");
    toast.error("Les identifiants de connexion sont incorrects");
  } else if (event === 'SIGNED_IN' && session) {
    console.log("User signed in successfully.");
  } else {
    console.error("Unexpected authentication event:", event);
    toast.error("Une erreur inattendue est survenue lors de l'authentification");
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    console.log("User signed out or deleted.");
  } else if (event === 'SIGNED_IN' && !session) {
    console.error("Authentication error: Invalid credentials.");
    toast.error("Les identifiants de connexion sont incorrects");
  } else {
    console.error("Unexpected authentication event:", event);
    toast.error("Une erreur inattendue est survenue lors de l'authentification");
  }
});