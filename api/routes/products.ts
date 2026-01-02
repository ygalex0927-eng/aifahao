import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../supabase.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, page = 1, limit = 20 } = req.query
  
  let query = supabaseAdmin.from('products').select('*', { count: 'exact' })
  
  if (category) {
    query = query.eq('category', category)
  }

  // Filter active products
  query = query.eq('is_active', true)

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
      products: data,
      total: count,
      page: Number(page),
      limit: Number(limit)
    }
  })
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    res.status(404).json({ success: false, error: 'Product not found' })
    return
  }

  res.json({
    success: true,
    data: data
  })
})

export default router
