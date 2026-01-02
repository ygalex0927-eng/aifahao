import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Ticket, UserCircle, ShieldAlert } from 'lucide-react'
import { useUserStore } from '../store/useUserStore'

export default function Navbar() {
  const { user, logout } = useUserStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = async () => {
      await logout()
      setDropdownOpen(false)
      navigate('/login')
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // If we are not on the home page, let the default link behavior happen (navigate to /#id)
    if (window.location.pathname !== '/') return;

    e.preventDefault();
    if (id.startsWith('#')) {
      const element = document.getElementById(id.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-[#0F0F0F] text-white py-4 px-6 fixed w-full top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-[#E50914] text-white px-2 py-1 rounded text-sm font-bold">N</span>
            爱发濠
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-gray-300">首页</Link>
          <a href="/#hot-sale-section" onClick={(e) => handleScroll(e, '#hot-sale-section')} className="hover:text-gray-300 cursor-pointer">热销拼车</a>
          <a href="/#solo-section" onClick={(e) => handleScroll(e, '#solo-section')} className="hover:text-gray-300 cursor-pointer">独享专区</a>
          <a href="/#short-term" className="hover:text-gray-300 cursor-pointer">短期体验</a>
        </div>
        <div className="flex items-center gap-6" ref={dropdownRef}>
          {user ? (
              <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:text-gray-300 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border border-gray-600">
                        {user.user_metadata?.nickname?.[0] || 'U'}
                    </div>
                  </button>

                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 py-2 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-800 mb-1">
                              <p className="text-sm font-bold text-white truncate">{user.user_metadata?.nickname || 'User'}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link 
                            to="/tickets" 
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                              <Ticket size={16} />
                              我的车票
                          </Link>
                          {user.is_admin && (
                              <Link 
                                to="/admin" 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E50914] hover:bg-white/10 hover:text-[#b2070f] transition font-bold"
                                onClick={() => setDropdownOpen(false)}
                              >
                                  <ShieldAlert size={16} />
                                  管理后台
                              </Link>
                          )}
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            onClick={() => setDropdownOpen(false)}
                          >
                              <UserCircle size={16} />
                              个人中心
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-white/10 transition border-t border-gray-800 mt-1"
                          >
                              <LogOut size={16} />
                              退出登录
                          </button>
                      </div>
                  )}
              </div>
          ) : (
            <Link to="/login" className="hover:text-gray-300">
                <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
