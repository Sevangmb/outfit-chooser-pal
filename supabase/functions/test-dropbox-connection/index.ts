import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Testing Dropbox connection...')
    
    // Get current user session
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError) {
      console.error('Error retrieving user:', userError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to retrieve user information'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }
    if (!user) throw new Error('User not found')

    // Get user's Dropbox connection
    const { data: connections, error: connectionError } = await supabase
      .from('dropbox_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError) {
      console.error('Error fetching Dropbox connection:', connectionError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to retrieve Dropbox connection'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    if (!connections?.access_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Dropbox access token found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Test the connection by making a simple API call to Dropbox
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connections.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Error testing Dropbox connection:', await response.text())
      throw new Error('Failed to connect to Dropbox')
    }

    const accountInfo = await response.json()
    console.log('Dropbox connection successful:', accountInfo)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully connected to Dropbox',
        account: accountInfo
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )

  } catch (error) {
    console.error('Error in test-dropbox-connection:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})