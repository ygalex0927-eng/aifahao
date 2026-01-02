import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'
import { Users, Database, LayoutDashboard, Search, Edit, Save, Terminal, ShieldAlert, Ticket, Package, Trash2, Plus, X } from 'lucide-react'
import axios from 'axios'

import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
    const { user, isAdmin } = useUserStore()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'users' | 'tickets' | 'products' | 'database'>('users')
    
    // Generic Data State
    const [data, setData] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [editingItem, setEditingItem] = useState<any>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Database SQL State
    const [sqlQuery, setSqlQuery] = useState('')
    const [sqlResult, setSqlResult] = useState<any>(null)
    const [sqlError, setSqlError] = useState('')

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate('/')
            return
        }
        if (activeTab !== 'database') {
            fetchData()
        }
    }, [user, isAdmin, activeTab, page, navigate])

    const getAuthToken = async () => {
        const { data } = await supabase.auth.getSession()
        return data.session?.access_token
    }

    const fetchData = async () => {
        setLoading(true)
        setError('')
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('No auth token')

            const res = await axios.get(`/api/admin/${activeTab}`, {
                params: { page, search },
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                // Ensure data is array
                const resultData = res.data.data[activeTab] || []
                setData(Array.isArray(resultData) ? resultData : [])
                setTotal(res.data.data.total || 0)
            }
        } catch (error: any) {
            console.error(error)
            setError(error.response?.data?.error || error.message)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPage(1)
        fetchData()
    }

    const handleUpdate = async (id: string, updates: any) => {
        try {
            const token = await getAuthToken()
            
            // Handle JSON fields
            const dataToUpdate = { ...updates }
            if (typeof dataToUpdate.specifications === 'string') {
                try {
                    dataToUpdate.specifications = JSON.parse(dataToUpdate.specifications)
                } catch (e) {
                    alert('规格 JSON 格式无效')
                    return
                }
            }

            await axios.put(`/api/admin/${activeTab}/${id}`, dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('更新成功')
            setEditingItem(null)
            fetchData()
        } catch (error) {
            alert('更新失败')
        }
    }

    const handleCreate = async (item: any) => {
        try {
            const token = await getAuthToken()
            
            // Handle JSON fields
            const dataToCreate = { ...item }
            if (typeof dataToCreate.specifications === 'string') {
                try {
                    dataToCreate.specifications = JSON.parse(dataToCreate.specifications)
                } catch (e) {
                    alert('规格 JSON 格式无效')
                    return
                }
            }

            await axios.post(`/api/admin/${activeTab}`, dataToCreate, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('创建成功')
            setIsCreating(false)
            fetchData()
        } catch (error) {
            alert('创建失败')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除吗？')) return
        try {
            const token = await getAuthToken()
            await axios.delete(`/api/admin/${activeTab}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('删除成功')
            fetchData()
        } catch (error) {
            alert('删除失败')
        }
    }

    const handleExecuteSql = async () => {
        if (!sqlQuery.trim()) return
        setSqlError('')
        setSqlResult(null)
        try {
            const token = await getAuthToken()
            const res = await axios.post('/api/admin/sql', { query: sqlQuery }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setSqlResult(res.data.data)
            }
        } catch (error: any) {
            setSqlError(error.response?.data?.error || error.message)
        }
    }

    if (!isAdmin) return null

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex text-white pt-16">
            {/* Sidebar */}
            <div className="w-64 bg-[#111] border-r border-gray-800 p-4 fixed h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <ShieldAlert className="text-[#E50914]" />
                    <span className="font-bold text-lg">管理后台</span>
                </div>
                
                <nav className="space-y-2">
                    <button 
                        onClick={() => { setActiveTab('users'); setPage(1); setSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${activeTab === 'users' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Users size={18} />
                        用户管理
                    </button>
                    <button 
                        onClick={() => { setActiveTab('tickets'); setPage(1); setSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${activeTab === 'tickets' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Ticket size={18} />
                        车票管理
                    </button>
                    <button 
                        onClick={() => { setActiveTab('products'); setPage(1); setSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${activeTab === 'products' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Package size={18} />
                        商品管理
                    </button>
                    <button 
                        onClick={() => setActiveTab('database')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${activeTab === 'database' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Database size={18} />
                        数据库 SQL
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {activeTab !== 'database' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold capitalize">{
                                activeTab === 'users' ? '用户管理' :
                                activeTab === 'tickets' ? '车票管理' :
                                activeTab === 'products' ? '商品管理' : '管理'
                            }</h2>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="搜索..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="bg-[#222] border border-gray-700 rounded px-4 py-2 text-sm text-white focus:border-[#E50914] outline-none w-64"
                                />
                                <button onClick={handleSearch} className="bg-[#333] p-2 rounded hover:bg-[#444]">
                                    <Search size={18} />
                                </button>
                                {activeTab === 'products' && (
                                    <button onClick={() => setIsCreating(true)} className="bg-[#E50914] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold hover:bg-[#b2070f]">
                                        <Plus size={16} /> 添加商品
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Create Modal (Simple version for Products) */}
                        {isCreating && activeTab === 'products' && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-lg border border-gray-800">
                                    <h3 className="text-xl font-bold mb-4">添加新商品</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.currentTarget)
                                        const newItem = Object.fromEntries(formData.entries())
                                        handleCreate(newItem)
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input name="title" placeholder="标题" required className="col-span-2 bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <input name="price" type="number" placeholder="价格" required className="bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <input name="original_price" type="number" placeholder="原价" className="bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <input name="category" placeholder="分类 (hot-sale/solo)" required className="bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <input name="tag" placeholder="标签 (如: 拼车)" className="bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <input name="stock" type="number" placeholder="库存" defaultValue={100} className="bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                            <select name="delivery_method" className="bg-[#333] p-2 rounded border border-gray-700 text-sm">
                                                <option value="automatic">自动发货</option>
                                                <option value="manual">人工发货</option>
                                            </select>
                                        </div>
                                        <textarea name="description" placeholder="描述" className="w-full bg-[#333] p-2 rounded border border-gray-700 text-sm h-24" />
                                        <textarea 
                                            name="specifications" 
                                            placeholder='规格 (JSON 格式, 例如: {"quality": "4K", "region": "Global"})' 
                                            className="w-full bg-[#333] p-2 rounded border border-gray-700 text-sm font-mono h-20" 
                                            defaultValue='{"quality": "4K", "region": "Global", "duration": "30 Days"}'
                                        />
                                        <input name="cover_image" placeholder="图片链接" className="w-full bg-[#333] p-2 rounded border border-gray-700 text-sm" />
                                        
                                        <div className="flex justify-end gap-2 mt-6">
                                            <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">取消</button>
                                            <button type="submit" className="bg-[#E50914] text-white px-6 py-2 rounded font-bold text-sm">创建商品</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#111] rounded-lg border border-gray-800 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#1A1A1A] text-white">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        {activeTab === 'users' && (
                                            <>
                                                <th className="p-4">用户信息</th>
                                                <th className="p-4">联系方式</th>
                                                <th className="p-4">角色</th>
                                                <th className="p-4">创建时间</th>
                                            </>
                                        )}
                                        {activeTab === 'tickets' && (
                                            <>
                                                <th className="p-4">商品信息</th>
                                                <th className="p-4">账号信息</th>
                                                <th className="p-4">时长</th>
                                                <th className="p-4">状态</th>
                                            </>
                                        )}
                                        {activeTab === 'products' && (
                                            <>
                                                <th className="p-4">商品信息</th>
                                                <th className="p-4">价格</th>
                                                <th className="p-4">分类/标签</th>
                                                <th className="p-4">库存/状态</th>
                                            </>
                                        )}
                                        <th className="p-4">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.id} className="border-b border-gray-800 hover:bg-white/5">
                                            <td className="p-4 font-mono text-xs text-gray-500">
                                                {item.id.slice(0, 8)}...
                                                <div className="mt-1 opacity-50 text-[10px]">{item.id}</div>
                                            </td>
                                            
                                            {/* Users Columns */}
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.avatar_url ? (
                                                                <img src={item.avatar_url} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                                                    {item.nickname?.[0] || item.username?.[0] || 'U'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                {editingItem?.id === item.id ? (
                                                                    <div className="space-y-1">
                                                                        <input 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                            placeholder="用户名"
                                                                            value={editingItem.username || ''}
                                                                            onChange={e => setEditingItem({...editingItem, username: e.target.value})}
                                                                        />
                                                                        <input 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                            placeholder="昵称"
                                                                            value={editingItem.nickname || ''}
                                                                            onChange={e => setEditingItem({...editingItem, nickname: e.target.value})}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-medium text-white">{item.username || '暂无用户名'}</div>
                                                                        <div className="text-xs text-gray-500">{item.nickname || '暂无昵称'}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-1">
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                    placeholder="邮箱"
                                                                    value={editingItem.email || ''}
                                                                    onChange={e => setEditingItem({...editingItem, email: e.target.value})}
                                                                />
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                    placeholder="手机号"
                                                                    value={editingItem.phone || ''}
                                                                    onChange={e => setEditingItem({...editingItem, phone: e.target.value})}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm">{item.email}</div>
                                                                <div className="text-xs text-gray-500">{item.phone || '-'}</div>
                                                                {item.wechat_openid && <div className="text-[10px] text-green-500">已绑定微信</div>}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={editingItem.is_admin || false}
                                                                    onChange={e => setEditingItem({...editingItem, is_admin: e.target.checked})}
                                                                />
                                                                <span className="text-sm">管理员权限</span>
                                                            </label>
                                                        ) : (
                                                            item.is_admin ? 
                                                                <span className="bg-red-900/50 text-red-200 px-2 py-0.5 rounded text-xs border border-red-900">管理员</span> : 
                                                                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">用户</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-xs text-gray-500">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </td>
                                                </>
                                            )}

                                            {/* Tickets Columns */}
                                            {activeTab === 'tickets' && (
                                                <>
                                                    <td className="p-4">
                                                        <div className="text-sm font-medium text-white">{item.product_type}</div>
                                                        <div className="text-xs text-gray-500">用户: {item.users?.username || item.users?.email}</div>
                                                        <div className="text-[10px] text-gray-600 mt-1">订单: {item.order_id?.slice(0,8)}...</div>
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-1">
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs font-mono"
                                                                    placeholder="账号"
                                                                    value={editingItem.account_username || ''}
                                                                    onChange={e => setEditingItem({...editingItem, account_username: e.target.value})}
                                                                />
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs font-mono"
                                                                    placeholder="密码"
                                                                    value={editingItem.account_password || ''}
                                                                    onChange={e => setEditingItem({...editingItem, account_password: e.target.value})}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500">账:</span>
                                                                    <span className="font-mono text-xs">{item.account_username}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500">密:</span>
                                                                    <span className="font-mono text-xs">{item.account_password}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-1">
                                                                <input 
                                                                    type="datetime-local"
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-[10px]"
                                                                    value={editingItem.start_time ? new Date(editingItem.start_time).toISOString().slice(0, 16) : ''}
                                                                    onChange={e => setEditingItem({...editingItem, start_time: new Date(e.target.value).toISOString()})}
                                                                />
                                                                <input 
                                                                    type="datetime-local"
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-[10px]"
                                                                    value={editingItem.end_time ? new Date(editingItem.end_time).toISOString().slice(0, 16) : ''}
                                                                    onChange={e => setEditingItem({...editingItem, end_time: new Date(e.target.value).toISOString()})}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs space-y-0.5">
                                                                <div className="text-green-500">起: {new Date(item.start_time).toLocaleDateString()}</div>
                                                                <div className="text-red-500">止: {new Date(item.end_time).toLocaleDateString()}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <select 
                                                                className="bg-[#333] px-2 py-1 rounded text-xs"
                                                                value={editingItem.status}
                                                                onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                                                            >
                                                                <option value="active">生效中</option>
                                                                <option value="expired">已过期</option>
                                                                <option value="pending">待处理</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                                                {item.status === 'active' ? '生效中' : 
                                                                 item.status === 'expired' ? '已过期' : 
                                                                 item.status === 'pending' ? '待处理' : item.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Products Columns */}
                                            {activeTab === 'products' && (
                                                <>
                                                    <td className="p-4">
                                                        <div className="flex gap-3">
                                                            <img src={item.cover_image} alt={item.title} className="w-12 h-16 object-cover rounded bg-gray-800" referrerPolicy="no-referrer" />
                                                            <div className="flex-1 min-w-[200px]">
                                                                {editingItem?.id === item.id ? (
                                                                    <div className="space-y-2">
                                                                        <input 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-sm font-bold"
                                                                            placeholder="标题"
                                                                            value={editingItem.title || ''}
                                                                            onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                                                                        />
                                                                        <textarea 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-xs h-16"
                                                                            placeholder="描述"
                                                                            value={editingItem.description || ''}
                                                                            onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                                                        />
                                                                        <textarea 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-[10px] font-mono h-16"
                                                                            placeholder="规格 JSON"
                                                                            value={typeof editingItem.specifications === 'object' ? JSON.stringify(editingItem.specifications, null, 2) : (editingItem.specifications || '')}
                                                                            onChange={e => setEditingItem({...editingItem, specifications: e.target.value})}
                                                                        />
                                                                        <input 
                                                                            className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                            placeholder="图片链接"
                                                                            value={editingItem.cover_image || ''}
                                                                            onChange={e => setEditingItem({...editingItem, cover_image: e.target.value})}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-bold text-white line-clamp-1">{item.title}</div>
                                                                        <div className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</div>
                                                                        <div className="text-[10px] text-gray-600 mt-1 truncate">{item.cover_image}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-1 w-24">
                                                                <input 
                                                                    type="number"
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-white text-xs"
                                                                    placeholder="价格"
                                                                    value={editingItem.price || 0}
                                                                    onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                                                                />
                                                                <input 
                                                                    type="number"
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-gray-400 text-xs"
                                                                    placeholder="原价"
                                                                    value={editingItem.original_price || 0}
                                                                    onChange={e => setEditingItem({...editingItem, original_price: parseFloat(e.target.value)})}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className="text-white font-bold">¥{item.price}</div>
                                                                <div className="text-xs text-gray-500 line-through">¥{item.original_price}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-1 w-24">
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                    placeholder="分类"
                                                                    value={editingItem.category || ''}
                                                                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                                                                />
                                                                <input 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                    placeholder="标签"
                                                                    value={editingItem.tag || ''}
                                                                    onChange={e => setEditingItem({...editingItem, tag: e.target.value})}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <span className="bg-blue-900/30 text-blue-200 px-2 py-0.5 rounded text-xs block w-fit">{item.category}</span>
                                                                {item.tag && <span className="bg-purple-900/30 text-purple-200 px-2 py-0.5 rounded text-xs block w-fit">{item.tag}</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {editingItem?.id === item.id ? (
                                                            <div className="space-y-2 w-24">
                                                                <input 
                                                                    type="number"
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-xs"
                                                                    placeholder="库存"
                                                                    value={editingItem.stock || 0}
                                                                    onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value)})}
                                                                />
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={editingItem.is_active ?? true}
                                                                        onChange={e => setEditingItem({...editingItem, is_active: e.target.checked})}
                                                                    />
                                                                    <span className="text-xs">上架</span>
                                                                </label>
                                                                <select 
                                                                    className="bg-[#333] px-2 py-1 rounded w-full text-[10px]"
                                                                    value={editingItem.delivery_method || 'automatic'}
                                                                    onChange={e => setEditingItem({...editingItem, delivery_method: e.target.value})}
                                                                >
                                                                    <option value="automatic">自动</option>
                                                                    <option value="manual">人工</option>
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className={`text-xs ${item.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    库存: {item.stock}
                                                                </div>
                                                                <div className="text-[10px] text-gray-500">
                                                                    {item.delivery_method === 'automatic' ? '自动发货' : '人工发货'}
                                                                </div>
                                                                {item.is_active === false && (
                                                                    <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px]">已下架</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            <td className="p-4">
                                                <div className="flex gap-3">
                                                    {editingItem?.id === item.id ? (
                                                        <>
                                                            <button onClick={() => handleUpdate(item.id, editingItem)} className="text-green-500 hover:text-green-400"><Save size={16} /></button>
                                                            <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-400"><X size={16} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-blue-400">
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {activeTab === 'products' && (
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loading && <div className="p-8 text-center text-gray-500">加载中...</div>}
                            {error && <div className="p-8 text-center text-red-500">错误: {error}</div>}
                            {!loading && !error && data.length === 0 && <div className="p-8 text-center text-gray-500">暂无数据</div>}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-6">
                            <div className="text-sm text-gray-500">
                                显示 {(page - 1) * 20 + 1} 到 {Math.min(page * 20, total)} 条，共 {total} 条
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded text-sm hover:bg-[#333] disabled:opacity-50"
                                >
                                    上一页
                                </button>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded text-sm hover:bg-[#333] disabled:opacity-50"
                                >
                                    下一页
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Terminal /> SQL 执行
                        </h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-lg mb-6 text-sm">
                            警告：此功能允许直接执行 SQL 命令，请务必谨慎。
                        </div>

                        <div className="space-y-4">
                            <textarea 
                                value={sqlQuery}
                                onChange={e => setSqlQuery(e.target.value)}
                                placeholder="SELECT * FROM users;"
                                className="w-full h-40 bg-[#111] border border-gray-800 rounded-lg p-4 font-mono text-sm text-green-400 outline-none focus:border-[#E50914]"
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleExecuteSql}
                                    className="bg-[#E50914] text-white px-6 py-2 rounded font-bold hover:bg-[#b2070f] transition"
                                >
                                    执行
                                </button>
                            </div>
                        </div>

                        {sqlError && (
                            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                                {sqlError}
                            </div>
                        )}

                        {sqlResult && (
                            <div className="mt-6 bg-[#111] border border-gray-800 rounded-lg p-4 overflow-auto">
                                <pre className="font-mono text-xs text-gray-300">
                                    {JSON.stringify(sqlResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
