import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export const createClient = (supabaseUrl: string, supabaseKey: string, options = {}) => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    ...options,
  })
}