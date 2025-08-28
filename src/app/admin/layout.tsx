'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { useEffect } from 'react'

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Allow login page without authentication
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [status, isLoginPage, router])

  if (status === 'loading') {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${ibmPlexArabic.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Render login page without admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Check authentication for other admin pages
  if (!session || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(session.user.role)) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${ibmPlexArabic.className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">غير مخول للوصول</p>
          <button 
            onClick={() => router.push('/admin/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${ibmPlexArabic.className}`} dir="rtl">
      <AdminHeader />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 lg:mr-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}