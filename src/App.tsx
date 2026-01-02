import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { useUserStore } from './store/useUserStore'
import Checkout from './pages/Checkout'
import Tickets from './pages/Tickets'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  const fetchUser = useUserStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <BrowserRouter>
      <div className="bg-black min-h-screen text-white font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
