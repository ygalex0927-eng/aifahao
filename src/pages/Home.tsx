import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { ShoppingCart, Wallet, Zap, ShieldCheck, RotateCcw, Star, User } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'

interface Product {
  id: string
  title: string
  price: number
  original_price: number
  tag: string
  cover_image: string
  category: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products')
        if (res.data.success) {
          setProducts(res.data.data.products)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="text-white text-center py-20">Loading...</div>

  // Add error handling state display if needed
  if (!products.length && !loading) return <div className="text-white text-center py-20">暂无商品数据或加载失败，请刷新重试</div>

  return (
    <div className="bg-black min-h-screen pt-20 pb-10">
      {/* Hero Carousel */}
      <HeroCarousel />



      {/* Product Sections */}
      <div id="hot-sale-section" className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#E50914] rounded-full"></span>
            热销拼车 (拼车专区)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.category === 'hot-sale').sort((a, b) => a.price - b.price).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>

      <div id="solo-section" className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#E50914] rounded-full"></span>
            独享专区 (隐私安全)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.category === 'solo').sort((a, b) => a.price - b.price).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-6 mt-24 mb-16">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">为什么选爱发濠拼车？</h2>
            <p className="text-gray-400">我们致力于为用户提供最安全、最便捷、最实惠的流媒体账号租赁服务</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition group text-center">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E50914]/10 transition">
                    <Wallet className="text-[#E50914] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">价格对比，省钱 80%</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    通过拼车机制，以极低价格享受官方原版服务，远低于官方定价。
                </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition group text-center">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E50914]/10 transition">
                    <Zap className="text-[#E50914] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">系统自动化，秒级发货</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    库存充足，支持账号系统自动配置并发放账号，无需第三人干预。
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition group text-center">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E50914]/10 transition">
                    <ShieldCheck className="text-[#E50914] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">售后无忧，专业保障</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    提供 7x24 小时技术支持，保障您的观影体验不中断。
                </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition group text-center">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E50914]/10 transition">
                    <RotateCcw className="text-[#E50914] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">稳定可靠，翻车包赔</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    账号突发问题导致无法使用，我们提供快速补偿机制。
                </p>
            </div>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">用户好评</h2>
            <p className="text-gray-400">来自真实用户的声音，他们为什么选择爱发濠拼车</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-500 text-xs">2025-12-24</span>
                </div>
                <p className="text-white mb-6 text-sm leading-relaxed">
                    "第一次拼车，体验非常好！平台发的账号非常稳定，客服的响应也很快，比自己买便宜太多了。"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center">
                        <User className="text-[#E50914]" size={20} />
                    </div>
                    <div>
                        <div className="text-white text-sm font-medium">王**明 (北京)</div>
                        <div className="text-gray-500 text-xs">已验证购买</div>
                    </div>
                </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-500 text-xs">2025-12-23</span>
                </div>
                <p className="text-white mb-6 text-sm leading-relaxed">
                    "4K画质太爽了，价格实惠，以前都是自己硬着头皮买一年，现在按季拼车，灵活多了。"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center">
                        <User className="text-[#E50914]" size={20} />
                    </div>
                    <div>
                        <div className="text-white text-sm font-medium">L***i (上海)</div>
                        <div className="text-gray-500 text-xs">已验证购买</div>
                    </div>
                </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-500 text-xs">2025-12-21</span>
                </div>
                <p className="text-white mb-6 text-sm leading-relaxed">
                    "发货速度确实是秒级，晚上11点下单秒收账号。PIN码和车位名都安排得清清楚楚，点赞！"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center">
                        <User className="text-[#E50914]" size={20} />
                    </div>
                    <div>
                        <div className="text-white text-sm font-medium">影迷小张 (广州)</div>
                        <div className="text-gray-500 text-xs">已验证购买</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
    return (
        <Link 
            to={`/product/${product.id}`} 
            className="bg-[#1A1A1A] rounded-lg overflow-hidden block group relative border border-transparent hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
            <div className="aspect-[16/9] bg-gray-800 relative overflow-hidden">
                <img 
                    src={product.cover_image} 
                    alt={product.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        // Fallback to a safe, lightweight color block if image fails to load
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%23555'%3ENetflix%3C/text%3E%3C/svg%3E";
                        e.currentTarget.onerror = null; // Prevent infinite loop
                    }}
                />
                <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">
                    {product.tag}
                </span>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-4">
                <h3 className="text-white font-medium mb-3 line-clamp-2 h-12 group-hover:text-[#E50914] transition-colors">
                    {product.title}
                </h3>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-0.5">拼车价</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[#E50914] text-xl font-bold">¥{product.price}</span>
                            <span className="text-gray-600 text-xs line-through">¥{product.original_price}</span>
                        </div>
                    </div>
                    <button className="bg-[#E50914] w-10 h-10 rounded-full text-white flex items-center justify-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#b2070f] shadow-lg">
                        <ShoppingCart size={18} />
                    </button>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>车位充足 · 秒级发货</span>
                </div>
            </div>
        </Link>
    )
}
