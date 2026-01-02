import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key')
}

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper to create client with user token
export const createUserClient = (token: string) => {
  return createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}
