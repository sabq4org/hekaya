import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function NotFound() {
  return (
    <div className={`${ibmPlexArabic.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">404</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              الصفحة غير موجودة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها إلى موقع آخر.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <Home className="w-5 h-5" />
                العودة للرئيسية
              </Button>
            </Link>
            
            <Link href="/blog">
              <Button 
                variant="outline"
                className="w-full gap-2 border-gray-300 dark:border-gray-600"
                size="lg"
              >
                <Search className="w-5 h-5" />
                تصفح المقالات
              </Button>
            </Link>

            <Link href="/admin/login">
              <Button 
                variant="ghost"
                className="w-full gap-2"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5" />
                لوحة التحكم
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              روابط مفيدة:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link 
                href="/about" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                من نحن
              </Link>
              <Link 
                href="/articles/ai-medical-diagnosis" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                مقال مميز
              </Link>
              <Link 
                href="/blog" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                المدونة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
