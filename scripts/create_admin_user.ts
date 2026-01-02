
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
  const email = 'admin@aifahao.com'
  const password = 'yagaozuishuai'
  const username = 'admin'
  const nickname = 'Super Admin'
  
  console.log('Creating admin user:', email)

  // 1. Create user via Admin API (bypasses email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname }
  })

  if (authError) {
    console.error('Auth Create Error:', authError)
    return
  }

  const user = authData.user
  console.log('Auth User Created:', user.id)

  // 2. Insert into public.users
  // We upsert to handle case if user record already exists (though id is unique)
  const { error: dbError } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    username: username,
    email: email,
    nickname: nickname,
    is_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' })

  if (dbError) {
    console.error('DB Insert Error:', dbError)
  } else {
    console.log('Admin user successfully created in DB and set as admin!')
  }
}

main()
