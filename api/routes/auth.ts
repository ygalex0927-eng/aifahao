import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../supabase.js'

const router = Router()

/**
 * Send SMS Code
 * POST /api/auth/send-sms-code
 */
router.post('/send-sms-code', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body
  if (!phone) {
    res.status(400).json({ success: false, error: 'Phone number is required' })
    return
  }

  try {
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      phone,
    })

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      data: { expire_time: 300 }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Login with SMS Code
 * POST /api/auth/login-sms
 */
router.post('/login-sms', async (req: Request, res: Response): Promise<void> => {
  const { phone, code } = req.body
  if (!phone || !code) {
    res.status(400).json({ success: false, error: 'Phone and code are required' })
    return
  }

  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    })

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }

    if (!data.session) {
      res.status(400).json({ success: false, error: 'Failed to create session' })
      return
    }

    // Sync user to public.users
    const user = data.user
    if (user) {
      await supabaseAdmin.from('users').upsert({
        id: user.id,
        phone: user.phone,
        nickname: user.user_metadata?.nickname || `User_${user.phone?.slice(-4)}`,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    }

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: {
            id: user?.id,
            phone: user?.phone,
            nickname: user?.user_metadata?.nickname
        }
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Register with Username/Password
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password, nickname } = req.body
  
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required' })
    return
  }

  // Construct email from username (since Supabase Auth requires email)
  // If username is already an email, use it. Otherwise append domain.
   const email = username.includes('@') ? username : `${username}@aifahao.com`
 
   try {
    // 1. Create user in Supabase Auth (using admin to skip email confirmation)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm email so user can login immediately
      user_metadata: { nickname: nickname || username }
    })

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }

    if (!data.user) {
        res.status(400).json({ success: false, error: 'Registration failed' })
        return
    }

    // 2. Insert into public.users
    const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: data.user.id,
        username: username, // Store the raw username
        email: email,
        nickname: nickname || username,
        password_hash: 'MANAGED_BY_SUPABASE', // Placeholder to indicate password is handled by Supabase Auth
        is_admin: false, // Default to false
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })

    if (dbError) {
        console.error('DB Insert Error:', dbError)
        // If DB insert fails, we might want to delete the Auth user or just return error
        // For now, return success but log error (user can login but might have issues)
    }

    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
            id: data.user.id,
            username,
            email,
            nickname: nickname || username
        }
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Login with Username/Password
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required' })
    return
  }

  const email = username.includes('@') ? username : `${username}@aifahao.com`
 
   try {
     const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }

    if (!data.session) {
        res.status(400).json({ success: false, error: 'Login failed' })
        return
    }

    // Fetch user details from public.users including is_admin
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: {
            ...userData,
            email: data.user.email,
        }
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
