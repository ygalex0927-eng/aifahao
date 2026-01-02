import { type Request, type Response, type NextFunction } from 'express'
import { supabaseAdmin } from '../supabase.js'

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
    
    (req as any).user = user
    next()
}
