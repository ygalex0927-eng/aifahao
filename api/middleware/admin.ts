import { type Request, type Response, type NextFunction } from 'express'
import { supabaseAdmin } from '../supabase.js'

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            res.status(401).json({ success: false, error: 'No token provided' })
            return
        }

        const token = authHeader.split(' ')[1]
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

        if (error || !user) {
            res.status(401).json({ success: false, error: 'Invalid token' })
            return
        }

        // Check if user is admin in public.users table
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (userError || !userData || !userData.is_admin) {
             res.status(403).json({ success: false, error: 'Admin access required' })
             return
        }

        (req as any).user = user
        next()
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' })
    }
}
