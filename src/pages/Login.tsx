import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/useUserStore'
import axios from 'axios'
import { X, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone')
  const [view, setView] = useState<'login' | 'register'>('login')
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const fetchUser = useUserStore((state) => state.fetchUser)

  // ... (previous handlers: handleSendCode, handlePhoneLogin, handleAccountLogin)

  // Handle Register
  const handleRegister = async () => {
    if (!username || !password) return alert('请输入用户名和密码')
    setLoading(true)
    try {
        const res = await axios.post('/api/auth/register', {
            username,
            password
        })
        
        if (res.data.success) {
            alert('注册成功，请登录')
            setView('login')
            setActiveTab('email') // Switch to account tab to login
        }
    } catch (error: any) {
        console.error(error)
        alert(error.response?.data?.error || '注册失败')
    } finally {
        setLoading(false)
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = () => {
    alert('请联系客服找回密码：support@aifahao.com')
  }

  // Handle Phone OTP Send
  const handleSendCode = async () => {
    if (!phone) return alert('请输入手机号')
    setLoading(true)
    try {
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) {
            alert(error.message)
        } else {
            alert('验证码已发送')
        }
    } catch (error) {
        console.error(error)
        alert('发送失败')
    } finally {
        setLoading(false)
    }
  }

  // Handle Phone Login
  const handlePhoneLogin = async () => {
    if (!phone || !code) return alert('请输入手机号和验证码')
    setLoading(true)
    try {
        const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
        if (error) {
            alert(error.message)
        } else if (data.session) {
            await fetchUser()
            navigate('/')
        }
    } catch (error) {
        console.error(error)
        alert('登录失败')
    } finally {
        setLoading(false)
    }
  }

  // Handle Username/Password Login (mapped to Email tab for now, or we can add a 3rd tab)
  const handleAccountLogin = async () => {
    if (!username || !password) return alert('请输入账号和密码')
    setLoading(true)
    try {
        const email = username.includes('@') ? username : `${username}@aifahao.com`
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            alert(error.message)
        } else if (data.session) {
            await fetchUser()
            navigate('/')
        }
    } catch (error) {
        console.error(error)
        alert('登录失败')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="bg-black/60 min-h-screen flex items-center justify-center backdrop-blur-sm fixed inset-0 z-50 animate-popup">
        <div className="bg-black/75 backdrop-blur-xl rounded-2xl w-[400px] relative overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 transform">
            {/* Close Button */}
            <button 
                onClick={() => navigate('/')} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            <div className="p-8 pt-10">
                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-white mb-8">
                    {view === 'login' ? '登录' : '注册'}
                </h1>

                {view === 'login' ? (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-white/20 mb-8">
                            <button 
                                onClick={() => setActiveTab('phone')}
                                className={`flex-1 pb-3 text-base font-medium transition-all relative ${
                                    activeTab === 'phone' 
                                    ? 'text-white' 
                                    : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                手机
                                {activeTab === 'phone' && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E50914]"></div>
                                )}
                            </button>
                            <button 
                                onClick={() => setActiveTab('email')}
                                className={`flex-1 pb-3 text-base font-medium transition-all relative ${
                                    activeTab === 'email' 
                                    ? 'text-white' 
                                    : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                账号
                                {activeTab === 'email' && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E50914]"></div>
                                )}
                            </button>
                        </div>

                        {/* Forms */}
                        <div className="space-y-4">
                            {activeTab === 'phone' ? (
                                <>
                                    <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors">
                                        <input 
                                            type="tel" 
                                            placeholder="请输入手机号" 
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                                        />
                                    </div>
                                    <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors flex items-center justify-between">
                                        <input 
                                            type="text" 
                                            placeholder="请输入验证码" 
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                                        />
                                        <button 
                                            onClick={handleSendCode}
                                            disabled={loading || !phone}
                                            className="text-white text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition whitespace-nowrap ml-2 disabled:opacity-50"
                                        >
                                            获取验证码
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handlePhoneLogin}
                                        disabled={loading}
                                        className="w-full bg-[#E50914] text-white py-3 rounded-lg font-bold hover:bg-[#b2070f] transition mt-4 disabled:opacity-70 shadow-lg"
                                    >
                                        {loading ? '登录中...' : '立即登录'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors">
                                        <input 
                                            type="text" 
                                            placeholder="请输入用户名 / 邮箱" 
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                                        />
                                    </div>
                                    <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors flex items-center justify-between">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            placeholder="请输入密码" 
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-white/40 hover:text-white transition ml-2"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleAccountLogin}
                                        disabled={loading}
                                        className="w-full bg-[#E50914] text-white py-3 rounded-lg font-bold hover:bg-[#b2070f] transition mt-4 disabled:opacity-70 shadow-lg"
                                    >
                                        {loading ? '登录中...' : '立即登录'}
                                    </button>
                                    
                                    <div className="flex justify-between items-center text-xs mt-4 px-1">
                                        <button 
                                            onClick={() => setView('register')}
                                            className="text-white/80 hover:text-white hover:underline transition"
                                        >
                                            注册账号
                                        </button>
                                        <button 
                                            onClick={handleForgotPassword}
                                            className="text-white/60 hover:text-white transition"
                                        >
                                            忘记密码？
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    /* Register View */
                    <div className="space-y-4">
                         <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors">
                            <input 
                                type="text" 
                                placeholder="设置用户名" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                            />
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/5 focus-within:border-white/30 transition-colors flex items-center justify-between">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="设置密码" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white/40 hover:text-white transition ml-2"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <button 
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full bg-[#E50914] text-white py-3 rounded-lg font-bold hover:bg-[#b2070f] transition mt-4 disabled:opacity-70 shadow-lg"
                        >
                            {loading ? '注册中...' : '立即注册'}
                        </button>

                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setView('login')}
                                className="text-white/80 text-sm hover:text-white hover:underline transition"
                            >
                                已有账号？去登录
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-white/40">
                        {view === 'login' ? '登录' : '注册'}即代表同意 <a href="#" className="text-white/60 hover:text-white hover:underline">《用户协议》</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}
