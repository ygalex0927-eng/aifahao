export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] text-gray-400 py-10 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
            <h3 className="text-white font-bold mb-4">爱发濠</h3>
            <p className="text-sm">专注于流媒体账号拼车服务，为您提供安全、实惠的观影体验。</p>
        </div>
        <div>
            <h4 className="text-white font-bold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">首页</a></li>
                <li><a href="#" className="hover:text-white">热销拼车</a></li>
                <li><a href="#" className="hover:text-white">独享专区</a></li>
            </ul>
        </div>
        <div>
            <h4 className="text-white font-bold mb-4">帮助中心</h4>
            <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">常见问题</a></li>
                <li><a href="#" className="hover:text-white">售后服务</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
            </ul>
        </div>
        <div>
            <h4 className="text-white font-bold mb-4">关注我们</h4>
            <p className="text-sm">微信公众号：爱发濠</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs">
        &copy; 2024 爱发濠. All rights reserved.
      </div>
    </footer>
  )
}
