'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { IBM_Plex_Sans_Arabic } from 'next/font/google'

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

  if (!session || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(session.user.role)) {
    redirect('/admin/login')
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${ibmPlexArabic.className}`} dir="rtl">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 mr-64 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}