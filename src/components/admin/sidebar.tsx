'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  Tag,
  Image as ImageIcon,
  Mail,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  {
    label: 'نظرة عامة',
    href: '/admin',
    icon: <Home className="w-5 h-5" />
  },
  {
    label: 'المقالات',
    href: '/admin/posts',
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'التعليقات',
    href: '/admin/comments',
    icon: <MessageSquare className="w-5 h-5" />,
    badge: '3'
  },
  {
    label: 'التصنيفات',
    href: '/admin/categories',
    icon: <Tag className="w-5 h-5" />
  },
  {
    label: 'التحليلات',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    label: 'المستخدمون',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />
  },
  {
    label: 'الوسائط',
    href: '/admin/media',
    icon: <ImageIcon className="w-5 h-5" />
  },
  {
    label: 'النشرة البريدية',
    href: '/admin/newsletter',
    icon: <Mail className="w-5 h-5" />
  },
  {
    label: 'الإعدادات',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    document.cookie = 'auth-token=; max-age=0; path=/';
    window.location.href = '/admin/login';
  }

  return (
    <aside className={`${ibmPlexArabic.className} w-64 bg-white dark:bg-gray-800 h-screen sticky top-0`} style={{ borderLeft: '1px solid #f0f0ef' }}>
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              حكاية AI
            </h2>
            <Sparkles className="w-6 h-6 text-yellow-500 dark:text-yellow-400 animate-pulse" />
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">لوحة التحكم</p>
        </div>

        {/* New Post Button */}
        <Link href="/admin/posts/new" className="block mb-6">
          <Button 
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            style={{ borderRadius: '8px', boxShadow: 'none' }}
          >
            <Plus className="w-4 h-4" />
            مقال جديد
          </Button>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 text-purple-600 dark:text-purple-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive ? 'text-purple-600 dark:text-purple-400' : ''}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-8" style={{ borderTop: '1px solid #f0f0ef' }}>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
            style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </aside>
  )
}