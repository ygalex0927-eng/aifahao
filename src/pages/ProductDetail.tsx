import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCartStore } from '../store/useCartStore'
import { Check, ArrowLeft, Plus, Minus, CheckCircle2, Zap } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem, clearCart } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
        if (!id) return
        try {
            const res = await axios.get(`/api/products/${id}`)
            if (res.data.success) {
                setProduct(res.data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    fetchProduct()
  }, [id])

  if (loading) return <div className="text-white text-center py-20">Loading...</div>
  if (!product) return <div className="text-white text-center py-20">Product not found</div>

  const handleBuyNow = () => {
    // Direct buy: Clear existing cart, add current item, go to checkout
    clearCart()
    addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        cover_image: product.cover_image,
        quantity: quantity,
        specifications: product.specifications
    })
    navigate('/checkout')
  }

  return (
    <div className="bg-black min-h-screen pt-24 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Image Column */}
            <div className="space-y-8">
                <div className="rounded-xl overflow-hidden relative group shadow-2xl shadow-red-900/10">
                    <img 
                        src={product.cover_image} 
                        alt={product.title} 
                        className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%23555'%3ENetflix%3C/text%3E%3C/svg%3E";
                            e.currentTarget.onerror = null;
                        }}
                    />
                    <div className="absolute top-4 right-4 bg-[#E50914] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {product.stock > 0 ? '有库存' : '缺货'}
                    </div>
                    
                    {/* Poster Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="text-gray-400 text-xs mb-1">起步价</div>
                        <div className="text-[#E50914] text-3xl font-bold">¥{product.price}</div>
                    </div>
                </div>

                {/* Left Description (moved from right) */}
                <div className="hidden lg:block">
                     <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
                     <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
                     
                     <h3 className="text-gray-400 font-medium text-sm mb-3">核心亮点</h3>
                     <ul className="space-y-2 mb-8">
                        <li className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                            <span>{product.specifications?.quality || '4K UHD'} + HDR/Dolby Vision</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                            <span>独立观影 Profile，保障您的隐私</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                            <span>秒级发货，售后无忧</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                            <span>稳定耐用，翻车包赔</span>
                        </li>
                    </ul>

                    <h3 className="text-gray-400 font-medium text-sm mb-3">技术规格</h3>
                    <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between py-1.5 border-b border-gray-800">
                            <span>画质标准</span>
                            <span className="text-white">最高 {product.specifications?.quality || '4K UHD'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-800">
                            <span>支持设备</span>
                            <span className="text-white">电视/手机/平板/电脑</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-800">
                            <span>地区限制</span>
                            <span className="text-white">{product.specifications?.region === '全球' ? '无' : product.specifications?.region}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-800">
                            <span>车位数</span>
                            <span className="text-white">1/{product.specifications?.max_users || 5} (拼车)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pricing Card */}
            <div>
                <div className="bg-[#1A1A1A] rounded-xl p-8 border border-gray-800 h-fit sticky top-24">
                    <h2 className="text-2xl font-bold text-white mb-2">已选套餐</h2>
                    <p className="text-gray-500 text-sm mb-8">您当前选择的商品规格</p>

                    {/* Selected Specs Display */}
                    <div className="space-y-6 mb-8">
                        <div className="bg-black/30 rounded-lg p-6 border border-gray-700/50 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                                <span className="text-gray-400 text-sm">商品名称</span>
                                <span className="text-white font-medium text-right truncate ml-4">{product.title}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                                <span className="text-gray-400 text-sm">地区</span>
                                <span className="text-[#E50914] bg-[#E50914]/10 px-3 py-1 rounded text-sm">
                                    {product.specifications?.region || '全球通用'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                                <span className="text-gray-400 text-sm">时长</span>
                                <span className="text-[#E50914] bg-[#E50914]/10 px-3 py-1 rounded text-sm">
                                    {product.specifications?.duration || '月卡'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">类型</span>
                                <span className="text-white text-sm flex items-center gap-2">
                                    {product.tag || '拼车'} <CheckCircle2 size={16} className="text-green-500" />
                                </span>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between bg-black/30 rounded-lg p-4 border border-gray-700/50">
                            <span className="text-gray-400 text-sm">购买数量</span>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition hover:bg-white/10 rounded"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="text-white font-medium text-base w-8 text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition hover:bg-white/10 rounded"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-black/20 -mx-8 -mb-8 p-8 border-t border-gray-800 mt-auto">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-gray-500 text-xs mb-1">单价 ¥{product.price}</div>
                                <div className="text-white font-medium">合计</div>
                            </div>
                            <div className="text-[#E50914] text-4xl font-bold">
                                ¥{(product.price * quantity).toFixed(2)}
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleBuyNow}
                            className="w-full bg-[#E50914] text-white py-4 rounded font-bold hover:bg-[#b2070f] transition flex items-center justify-center gap-2 text-lg shadow-lg shadow-red-900/20 mb-4"
                        >
                            <Zap size={22} fill="currentColor" />
                            立即支付
                        </button>
                        
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-white transition"
                        >
                            <ArrowLeft size={16} />
                            继续浏览
                        </button>

                        <div className="flex justify-between text-[10px] text-gray-600 mt-6 pt-6 border-t border-gray-800/50">
                            <span className="flex items-center gap-1"><Check size={12} /> 秒级发货，支付后立即获取账号</span>
                            <span className="flex items-center gap-1"><Check size={12} /> 30天无忧售后保障</span>
                            <span className="flex items-center gap-1"><Check size={12} /> 翻车包赔，安全有保障</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Description (visible only on small screens) */}
            <div className="lg:hidden">
                <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
                {/* ... mobile specific content ... */}
            </div>
        </div>
    </div>
  )
}
