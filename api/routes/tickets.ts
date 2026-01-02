import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user
    const { status, page = 1, limit = 20 } = req.query

    let query = supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

    if (status) {
        query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const from = (Number(page) - 1) * Number(limit)
    const to = from + Number(limit) - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({
        success: true,
        data: {
            tickets: data,
            total: count
        }
    })
})

export default router
