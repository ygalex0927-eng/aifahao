import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user
    const { items } = req.body // Expect items array for checkout

    // Support legacy single item payload or new items array
    const orderItems = items || [{
        product_id: req.body.product_id,
        quantity: req.body.quantity
    }]
    
    // We'll process just the first item for now as the logic was single-product oriented, 
    // but ideally we loop. For "Ticket" logic, let's assume one main product per order for simplicity 
    // or create tickets for all.
    
    // Let's iterate.
    
    try {
        for (const item of orderItems) {
            const { product_id, quantity } = item

             // Get product details
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .select('*')
                .eq('id', product_id)
                .single()
            
            if (productError || !product) {
                console.error('Product error', productError)
                continue
            }

            const total_amount = product.price * quantity

            // 1. Create Order (Paid)
            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: user.id,
                    product_id,
                    quantity,
                    total_amount,
                    status: 'paid' // Auto-paid for demo
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Tickets
            // Generate dummy tickets based on quantity
            const tickets = []
            for (let i = 0; i < quantity; i++) {
                // Determine duration
                let durationDays = 30
                if (product.specifications?.duration?.includes('季')) durationDays = 90
                if (product.specifications?.duration?.includes('年')) durationDays = 365
                
                const startTime = new Date()
                const endTime = new Date()
                endTime.setDate(endTime.getDate() + durationDays)

                tickets.push({
                    user_id: user.id,
                    order_id: order.id,
                    account_username: `user_${Math.floor(Math.random() * 10000)}@netflix.com`,
                    account_password: `pass_${Math.floor(Math.random() * 10000)}`,
                    order_create_time: order.created_at,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    product_type: product.title || 'Netflix Premium',
                    status: 'active'
                })
            }

            const { error: ticketError } = await supabaseAdmin
                .from('tickets')
                .insert(tickets)

            if (ticketError) throw ticketError
        }

        res.json({ success: true })

    } catch (error: any) {
        console.error(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/', async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user
    const { status, page = 1, limit = 20 } = req.query

    let query = supabaseAdmin
        .from('orders')
        .select('*, products(title)', { count: 'exact' })
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
            orders: data,
            total: count
        }
    })
})

export default router
