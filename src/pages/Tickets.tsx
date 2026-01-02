import { useState, useEffect } from 'react'
import axios from 'axios'
import { useUserStore } from '../store/useUserStore'
import { Ticket, Clock, Copy, AlertCircle, History, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TicketData {
    id: string
    account_username: string
    account_password: string
    end_time: string
    product_type: string
    status: string
    coupon_info?: string
}

import { supabase } from '../lib/supabase'

export default function Tickets() {
    const [tickets, setTickets] = useState<TicketData[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useUserStore()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchTickets()
    }, [user, navigate])

    const fetchTickets = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            
            const res = await axios.get('/api/tickets', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setTickets(res.data.data.tickets)
            }
        } catch (error) {
            console.error('Failed to fetch tickets', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('复制成功')
    }

    const calculateTimeLeft = (endTime: string) => {
        const difference = +new Date(endTime) - +new Date()
        if (difference <= 0) return '已过期'
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        
        return `${days}天 ${hours}小时`
    }

    const filteredTickets = tickets.filter(t => {
        const isExpired = new Date(t.end_time) < new Date() || t.status === 'expired'
        return activeTab === 'active' ? !isExpired : isExpired
    })

    if (loading) return <div className="min-h-screen bg-black text-white pt-24 text-center">加载中...</div>

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-10 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Ticket className="text-[#E50914]" />
                        我的车票
                    </h1>
                    
                    <div className="flex bg-[#1A1A1A] p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-md text-sm transition ${activeTab === 'active' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            有效车票
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-md text-sm transition ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            历史记录
                        </button>
                    </div>
                </div>

                {filteredTickets.length === 0 ? (
                    <div className="bg-[#1A1A1A] rounded-xl p-10 text-center border border-gray-800">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket className="text-gray-500" size={32} />
                        </div>
                        <h3 className="text-xl font-medium mb-2">暂无{activeTab === 'active' ? '有效' : '历史'}车票</h3>
                        <p className="text-gray-500 mb-6">您购买的订阅服务将显示在这里</p>
                        {activeTab === 'active' && (
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-[#E50914] text-white px-6 py-2 rounded font-bold hover:bg-[#b2070f] transition"
                            >
                                去购买
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredTickets.map(ticket => (
                            <div key={ticket.id} className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition group">
                                <div className="bg-gradient-to-r from-gray-900 to-[#1A1A1A] p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-[#E50914] text-white text-xs px-2 py-0.5 rounded font-bold">Netflix</span>
                                            <h3 className="text-lg font-bold">{ticket.product_type}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                到期时间: {new Date(ticket.end_time).toLocaleDateString()}
                                            </span>
                                            <span className="text-[#E50914] font-medium bg-[#E50914]/10 px-2 py-0.5 rounded">
                                                剩余: {calculateTimeLeft(ticket.end_time)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {activeTab === 'active' && (
                                        <a 
                                            href="https://www.netflix.com/login" 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 transition text-sm w-fit"
                                        >
                                            <ExternalLink size={16} />
                                            去登录
                                        </a>
                                    )}
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-gray-500 text-xs">账号</label>
                                        <div className="flex items-center gap-2 bg-black/30 p-3 rounded border border-gray-700">
                                            <span className="flex-1 font-mono text-sm truncate">{ticket.account_username}</span>
                                            <button onClick={() => copyToClipboard(ticket.account_username)} className="text-gray-400 hover:text-white p-1">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 text-xs">密码</label>
                                        <div className="flex items-center gap-2 bg-black/30 p-3 rounded border border-gray-700">
                                            <span className="flex-1 font-mono text-sm truncate">••••••••</span>
                                            <button onClick={() => copyToClipboard(ticket.account_password)} className="text-gray-400 hover:text-white p-1 text-xs underline">
                                                复制密码
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-6 pb-4">
                                    <div className="bg-[#E50914]/5 border border-[#E50914]/20 rounded p-3 flex items-start gap-3">
                                        <AlertCircle className="text-[#E50914] shrink-0 mt-0.5" size={16} />
                                        <div className="text-xs text-gray-300 leading-relaxed">
                                            <p className="font-bold text-[#E50914] mb-1">注意事项：</p>
                                            <p>1. 请勿更改账号密码或Profile设置，否则可能会导致账号失效。</p>
                                            <p>2. 请仅在您的独立Profile中观看，以免影响其他车友。</p>
                                            <p>3. 如遇账号无法登录，请联系客服处理。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
