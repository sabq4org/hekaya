'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className={`${ibmPlexArabic.className} min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              عذراً، حدث خطأ أثناء تحميل هذه الصفحة. نحن نعمل على إصلاح المشكلة.
            </p>
            
            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
                    تفاصيل الخطأ التقنية
                  </summary>
                  <pre className="text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                    {error.message}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={reset}
              className="w-full gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              size="lg"
            >
              <RefreshCw className="w-5 h-5" />
              إعادة المحاولة
            </Button>
            
            <Link href="/">
              <Button 
                variant="outline"
                className="w-full gap-2 border-gray-300 dark:border-gray-600"
                size="lg"
              >
                <Home className="w-5 h-5" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              إذا استمر الخطأ، يرجى التواصل مع فريق الدعم الفني
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
