import { useCartStore } from '../store/useCartStore'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import axios from 'axios'
import { useUserStore } from '../store/useUserStore'
import { supabase } from '../lib/supabase'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const { user } = useUserStore()
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!user) {
        navigate('/login')
        return
    }
    
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        for (const item of items) {
            await axios.post('/api/orders', {
                product_id: item.id,
                quantity: item.quantity,
                contact_phone: user.phone || '13800000000'
            }, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            })
        }
        alert('订单创建成功！')
        clearCart()
        navigate('/profile')
    } catch (error) {
        console.error(error)
        alert('结算失败，请重试')
    }
  }

  if (items.length === 0) {
    return (
        <div className="bg-black min-h-screen pt-24 pb-10 px-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-6">购物车空空如也</h1>
            <Link to="/" className="text-[#E50914] hover:underline">去逛逛</Link>
        </div>
    )
  }

  return (
    <div className="bg-black min-h-screen pt-24 pb-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">购物车</h1>
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="bg-[#1A1A1A] p-4 rounded-lg flex gap-4 items-center">
                    <img 
                        src={item.cover_image} 
                        alt={item.title} 
                        className="w-20 h-20 object-cover rounded" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%23555'%3ENetflix%3C/text%3E%3C/svg%3E";
                            e.currentTarget.onerror = null;
                        }}
                    />
                    <div className="flex-1">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <div className="text-gray-400 text-sm">
                            {item.specifications?.duration} · {item.specifications?.quality}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-gray-400 hover:text-white"><Minus size={16} /></button>
                        <span className="text-white w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-white"><Plus size={16} /></button>
                    </div>
                    <div className="text-[#E50914] font-bold w-20 text-right">
                        ¥{item.price * item.quantity}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500">
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
        </div>
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-lg flex justify-between items-center">
            <div>
                <span className="text-gray-400">总计:</span>
                <span className="text-3xl font-bold text-[#E50914] ml-2">¥{totalPrice()}</span>
            </div>
            <button 
                onClick={handleCheckout}
                className="bg-[#E50914] text-white px-8 py-3 rounded font-bold hover:bg-[#b2070f] transition"
            >
                去结算
            </button>
        </div>
      </div>
    </div>
  )
}
