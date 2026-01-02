import { useEffect, useState } from 'react'
import { useUserStore } from '../store/useUserStore'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
        navigate('/login')
        return
    }

    const fetchOrders = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const res = await axios.get('/api/orders', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })
            if (res.data.success) {
                setOrders(res.data.data.orders)
            }
        } catch (error) {
            console.error(error)
        }
    }
    fetchOrders()
  }, [user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="bg-black min-h-screen pt-24 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">个人中心</h1>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white">退出登录</button>
            </div>
            
            <div className="bg-[#1A1A1A] p-6 rounded-lg mb-8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                    {user.user_metadata?.nickname?.[0] || 'U'}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user.user_metadata?.nickname || '用户'}</h2>
                    <p className="text-gray-400">{user.phone}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">我的订单</h2>
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-[#1A1A1A] p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">订单号: {order.id}</span>
                            <span className={`text-sm ${order.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {order.status === 'paid' ? '已开通' : '待支付'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <h3 className="text-white font-medium">{order.products?.title}</h3>
                            <span className="text-[#E50914] font-bold">¥{order.total_amount}</span>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-gray-500 text-center py-8">暂无订单</div>
                )}
            </div>
        </div>
    </div>
  )
}
