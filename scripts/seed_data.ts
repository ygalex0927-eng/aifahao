
import { supabaseAdmin } from '../api/supabase.js'

async function seedData() {
    console.log('Starting seed...')

    // 1. Create Products
    const products = [
        {
            title: 'Netflix 4K 高级车位 (月付)',
            description: '4K UHD画质，独立Profile，支持杜比视界/全景声，正规车队，翻车包赔。',
            price: 18.00,
            original_price: 25.00,
            category: 'hot-sale',
            tag: '拼车',
            specifications: { duration: '30天', region: '土耳其', quality: '4K HDR', max_users: 5 },
            stock: 100,
            cover_image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8efe30?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Netflix 4K 独享账号 (月付)',
            description: '个人独享完整账号，5个Profile全归你，可改密，适合家庭/朋友共享。',
            price: 98.00,
            original_price: 120.00,
            category: 'solo',
            tag: '独享',
            specifications: { duration: '30天', region: '土耳其', quality: '4K HDR', max_users: 5 },
            stock: 50,
            cover_image: 'https://images.unsplash.com/photo-1522869635100-1f4d06ee51c3?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Netflix 4K 长期车位 (年付)',
            description: '一次购买管一年，省心省力，到期自动续费，优先客服支持。',
            price: 198.00,
            original_price: 300.00,
            category: 'hot-sale',
            tag: '拼车',
            specifications: { duration: '365天', region: '巴基斯坦', quality: '4K HDR', max_users: 5 },
            stock: 200,
            cover_image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Disney+ 独享账号',
            description: '漫威、星战、皮克斯大片随意看，支持4K，家庭共享首选。',
            price: 45.00,
            original_price: 55.00,
            category: 'solo',
            tag: '独享',
            specifications: { duration: '30天', region: '全球', quality: '4K', max_users: 7 },
            stock: 30,
            cover_image: 'https://images.unsplash.com/photo-1616097970275-1e187b4ce59f?q=80&w=800&auto=format&fit=crop'
        }
    ]

    console.log('Seeding products...')
    for (const p of products) {
        // Check if exists
        const { data: existing } = await supabaseAdmin.from('products').select('id').eq('title', p.title).single()
        if (!existing) {
            await supabaseAdmin.from('products').insert(p)
            console.log(`Created product: ${p.title}`)
        } else {
            console.log(`Product already exists: ${p.title}`)
        }
    }

    // 2. Create Users
    const testUsers = [
        { email: 'user1@test.com', password: 'password123', nickname: 'TestUser1', phone: '13800138001' },
        { email: 'user2@test.com', password: 'password123', nickname: 'NetflixFan', phone: '13800138002' },
        { email: 'vip@test.com', password: 'password123', nickname: 'VIPUser', phone: '13800138003' }
    ]

    console.log('Seeding users...')
    const createdUsers = []
    for (const u of testUsers) {
        // Create in Auth
        // Note: admin.createUser auto confirms email
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { nickname: u.nickname }
        })

        if (error) {
            console.log(`User creation skipped/failed (${u.email}): ${error.message}`)
            // Try to find existing user in public.users to link tickets later
            const { data: existingUser } = await supabaseAdmin.from('users').select('*').eq('email', u.email).single()
            if (existingUser) createdUsers.push(existingUser)
        } else if (data.user) {
            console.log(`Created auth user: ${u.email}`)
            // Check if public.users record exists (trigger might have created it)
            // If not, create it manually or update it
            const { data: publicUser } = await supabaseAdmin.from('users').select('*').eq('id', data.user.id).single()
            
            if (!publicUser) {
                 // Insert into public users manually if trigger didn't fire
                 const { data: newUser } = await supabaseAdmin.from('users').insert({
                     id: data.user.id,
                     email: u.email,
                     nickname: u.nickname,
                     phone: u.phone,
                     username: u.nickname + '_' + Math.floor(Math.random() * 1000)
                 }).select().single()
                 if (newUser) createdUsers.push(newUser)
            } else {
                // Update phone/nickname just in case
                const { data: updatedUser } = await supabaseAdmin.from('users').update({
                    phone: u.phone,
                    nickname: u.nickname
                }).eq('id', data.user.id).select().single()
                 if (updatedUser) createdUsers.push(updatedUser)
            }
        }
    }

    // 3. Create Tickets for these users
    console.log('Seeding tickets...')
    if (createdUsers.length > 0) {
        // Get some products
        const { data: allProducts } = await supabaseAdmin.from('products').select('*')
        
        if (allProducts && allProducts.length > 0) {
            for (const user of createdUsers) {
                // Create 2-3 tickets per user
                const ticketCount = Math.floor(Math.random() * 3) + 1
                
                for (let i = 0; i < ticketCount; i++) {
                    const product = allProducts[Math.floor(Math.random() * allProducts.length)]
                    
                    // Create dummy order first
                    const { data: order } = await supabaseAdmin.from('orders').insert({
                        user_id: user.id,
                        product_id: product.id,
                        quantity: 1,
                        total_amount: product.price,
                        status: 'paid'
                    }).select().single()

                    if (order) {
                        const days = Math.floor(Math.random() * 60) + 1 // 1-60 days
                        const startTime = new Date()
                        // Some expired, some active
                        const isExpired = Math.random() > 0.7
                        if (isExpired) {
                            startTime.setDate(startTime.getDate() - 40) // Started 40 days ago
                        }
                        
                        const endTime = new Date(startTime)
                        endTime.setDate(endTime.getDate() + 30)

                        await supabaseAdmin.from('tickets').insert({
                            user_id: user.id,
                            order_id: order.id,
                            account_username: `netflix_${Math.random().toString(36).substring(7)}@example.com`,
                            account_password: `pass_${Math.random().toString(36).substring(7)}`,
                            product_type: product.title,
                            start_time: startTime.toISOString(),
                            end_time: endTime.toISOString(),
                            status: isExpired ? 'expired' : 'active',
                            order_create_time: order.created_at
                        })
                        console.log(`Created ticket for ${user.email} - ${product.title}`)
                    }
                }
            }
        }
    }

    console.log('Seed completed!')
}

seedData().catch(console.error)
