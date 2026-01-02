import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { ChevronLeft, ShoppingBag, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

import { supabase } from '../lib/supabase'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const user = useUserStore((state) => state.user)
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  // Calculate total safely
  const total = totalPrice ? totalPrice() : 0

  // Generate a random order ID for display if not yet created
  useEffect(() => {
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    setOrderId(`NF${timestamp}${random}`)
  }, [])

  const handlePayment = async () => {
    if (!user) {
        alert('请先登录')
        navigate('/login')
        return
    }
    
    setLoading(true)
    try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        // 1. Create Order
        const orderRes = await axios.post('/api/orders', {
            items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        }, {
            headers: { Authorization: `Bearer ${token}` } // Ideally use a better auth method
        })

        if (orderRes.data.success) {
            // 2. Simulate Payment
            // In a real app, we would redirect to payment gateway here
            // For now, we simulate a successful payment after a short delay
            setTimeout(async () => {
                alert('支付成功！')
                clearCart()
                navigate('/profile') // Or order success page
            }, 1500)
        }
    } catch (error) {
        console.error(error)
        alert('创建订单失败')
    } finally {
        setLoading(false)
    }
  }

  if (items.length === 0) {
      return (
          <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-10 px-6 flex flex-col items-center justify-center">
              <div className="text-gray-400 mb-4">购物车为空</div>
              <button 
                  onClick={() => navigate('/')}
                  className="bg-[#E50914] text-white px-6 py-2 rounded font-bold"
              >
                  去购物
              </button>
          </div>
      )
  }

  const discount = 5.00 // Example discount
  const finalTotal = total - discount

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-24 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 cursor-pointer hover:text-white transition w-fit" onClick={() => navigate(-1)}>
                <ChevronLeft size={16} />
                <span>返回上一页</span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-8">订单确认</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Order Summary */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/5">
                        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6 pb-4 border-b border-white/10">
                            <ShoppingBag className="text-[#E50914]" size={20} />
                            <span>订单摘要</span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-6">
                            <span className="text-gray-400">订单号</span>
                            <span className="text-white font-mono">{orderId}</span>
                        </div>

                        <div className="text-white font-medium mb-4">商品明细</div>
                        
                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-black/20 p-3 rounded-lg">
                                    <img src={item.cover_image} alt={item.title} className="w-16 h-24 object-cover rounded" referrerPolicy="no-referrer" />
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium mb-1">{item.title}</h3>
                                        <p className="text-gray-500 text-xs mb-1">
                                            {item.specifications?.region || '全球'} / {item.specifications?.duration || '月卡'} / {item.tag || '拼车'}
                                        </p>
                                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                                    </div>
                                    <div className="text-[#E50914] font-bold">
                                        ¥{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">小计</span>
                                <span className="text-white">¥{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">优惠</span>
                                <span className="text-green-500">-¥{discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/10">
                                <span className="text-white font-medium">实付金额</span>
                                <span className="text-[#E50914] text-3xl font-bold">¥{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Method */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/5">
                        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                            <ShieldCheck className="text-[#E50914]" size={20} />
                            <span>选择支付方式</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* WeChat Pay */}
                            <div 
                                onClick={() => setPaymentMethod('wechat')}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'wechat' 
                                    ? 'border-[#E50914] bg-[#E50914]/5' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-[#09BB07] flex items-center justify-center text-white font-bold text-xs">微</div>
                                        <div>
                                            <div className="text-white font-medium flex items-center gap-2">
                                                微信支付
                                                <span className="bg-white/10 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">推荐</span>
                                            </div>
                                            <div className="text-gray-500 text-xs mt-1">推荐，秒到账，自动发货。</div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'wechat' ? (
                                        <CheckCircle2 className="text-[#E50914]" size={20} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border border-gray-600"></div>
                                    )}
                                </div>
                            </div>

                            {/* Alipay */}
                            <div 
                                onClick={() => setPaymentMethod('alipay')}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'alipay' 
                                    ? 'border-[#E50914] bg-[#E50914]/5' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-[#1677FF] flex items-center justify-center text-white font-bold text-xs">支</div>
                                        <div>
                                            <div className="text-white font-medium">支付宝支付</div>
                                            <div className="text-gray-500 text-xs mt-1">支持扫码或 App 跳转支付。</div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'alipay' ? (
                                        <CheckCircle2 className="text-[#E50914]" size={20} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border border-gray-600"></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-[#E50914] text-white py-4 rounded font-bold hover:bg-[#b2070f] transition disabled:opacity-50 text-lg shadow-lg shadow-red-900/20"
                        >
                            {loading ? '支付处理中...' : `确认支付 ¥${finalTotal.toFixed(2)}`}
                        </button>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 flex items-center gap-3">
                        <Lock className="text-gray-500" size={20} />
                        <div>
                            <div className="text-white text-sm font-medium">安全支付保障</div>
                            <div className="text-gray-500 text-xs">您的支付信息已加密，支付过程完全安全。</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}