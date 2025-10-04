import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-peach flex items-center justify-center">
      <div className="text-center space-y-8 px-4">

        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-text-primary tracking-tight">
            404
          </h1>
          <div className="h-1 w-24 bg-primary-orange mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Trang không tìm thấy
          </h2>
          <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>
        
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-primary-green hover:bg-primary-green-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}