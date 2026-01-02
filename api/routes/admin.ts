import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../supabase.js'
import { authenticateAdmin } from '../middleware/admin.js'

const router = Router()

router.use(authenticateAdmin)

// Get all users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 20, search } = req.query
    
    let query = supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        
    if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
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
            users: data,
            total: count
        }
    })
})

// Update user
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({ success: true, data })
})

// Get all tickets
router.get('/tickets', async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 20, search } = req.query
    
    let query = supabaseAdmin
        .from('tickets')
        .select('*, users(username, email)', { count: 'exact' })
        
    if (search) {
        query = query.or(`account_username.ilike.%${search}%,product_type.ilike.%${search}%`)
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

// Update ticket
router.put('/tickets/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({ success: true, data })
})

// Get all products
router.get('/products', async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 20, search } = req.query
    
    let query = supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        
    if (search) {
        query = query.ilike('title', `%${search}%`)
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
            products: data,
            total: count
        }
    })
})

// Update product
router.put('/products/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({ success: true, data })
})

// Create product
router.post('/products', async (req: Request, res: Response): Promise<void> => {
    const product = req.body

    const { data, error } = await supabaseAdmin
        .from('products')
        .insert(product)
        .select()
        .single()

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({ success: true, data })
})

// Delete product
router.delete('/products/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        res.status(500).json({ success: false, error: error.message })
        return
    }

    res.json({ success: true })
})

// Execute raw SQL (Dangerous - for "database field modification" requirement)
// In a real production app, this should be strictly limited or avoided.
router.post('/sql', async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body
    
    // Supabase JS client doesn't expose a raw query method easily for public schema 
    // without creating a stored procedure. 
    // However, we can simulate "modifying fields" by using the RPC if one exists, 
    // or simply rely on table management if we build a UI for it.
    // Given the constraint "modify database fields", usually this implies DDL.
    // PostgreSQL DDL via Supabase client is not directly supported unless using a specific function.
    // For now, I will return a mock response or implemented a limited feature if requested.
    // BUT, the user asked for "modify database fields". 
    // Let's implement a safe way: allow adding columns via a specific RPC if we had one.
    // Since we can't easily do DDL from the client lib without setup, I'll stick to data modification 
    // and maybe hint that DDL requires direct SQL access or migrations.
    // Wait, I can use the 'rpc' method if I create a function `exec_sql`.
    
    // Let's create a stored procedure for admin SQL execution to fulfill the requirement.
    
    try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: query })
        if (error) throw error
        res.json({ success: true, data })
    } catch (error: any) {
        // If the function doesn't exist, we can't do it.
        // Let's fallback to explaining or just return error.
        res.status(400).json({ success: false, error: error.message || 'SQL execution failed' })
    }
})

export default router
