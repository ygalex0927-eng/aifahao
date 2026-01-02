import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    title: '花小钱，办大事',
    subtitle: 'Netflix 4K Premium 现已开放 5 人拼车！享受影院级画质，每月低至 ¥38。',
    cta: '立即上车',
    link: '#hot-sale-section'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop',
    title: '海量剧集，畅享无限',
    subtitle: 'Disney+, HBO Max, Apple TV+ 等多平台账号一站式购齐。',
    //cta: '探索独享专区',
    //link: '#solo-section'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop',
    title: '全家共享，快乐加倍',
    subtitle: '稳定可靠的车位保障，支持多设备同时观看。',
   // cta: '查看热销拼车',
    //link: '#hot-sale-section'
  }
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
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
    <div className="relative h-[500px] md:h-[600px] overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 transform transition-all duration-700 translate-y-0 opacity-100">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-xl">
              {slide.subtitle}
            </p>
            {slide.cta && (
              slide.link ? (
                <a 
                  href={slide.link}
                  onClick={(e) => handleScroll(e, slide.link)}
                  className="bg-[#E50914] text-white px-8 py-4 rounded font-bold hover:bg-[#b2070f] transition w-fit text-lg flex items-center gap-2"
                >
                  {slide.cta}
                  <ChevronRight size={20} />
                </a>
              ) : (
                <button className="bg-[#E50914] text-white px-8 py-4 rounded font-bold hover:bg-[#b2070f] transition w-fit text-lg flex items-center gap-2">
                  {slide.cta}
                  <ChevronRight size={20} />
                </button>
              )
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? 'bg-[#E50914] w-8' : 'bg-gray-400/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
