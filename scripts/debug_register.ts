
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  const email = 'testuser123@gmail.com'
  const password = 'yagaozuishuai'
  
  console.log('Attempting to register:', email)

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { nickname: 'Admin' }
    }
  })

  if (error) {
    console.error('SignUp Error:', error)
  } else {
    console.log('SignUp Success:', data)
  }
}

main()
