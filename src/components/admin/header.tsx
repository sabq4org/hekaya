'use client'

import { Button } from "@/components/ui/button"
import { Bell, Search, User, Menu, Moon, Sun, Settings, LogOut, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Tag,
  Image as ImageIcon,
  Mail,
  Plus,
  Sparkles
} from 'lucide-react'

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const navItems = [
  { label: 'نظرة عامة', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'المقالات', href: '/admin/posts', icon: <FileText className="w-5 h-5" /> },
  { label: 'التعليقات', href: '/admin/comments', icon: <MessageSquare className="w-5 h-5" />, badge: '3' },
  { label: 'التصنيفات', href: '/admin/categories', icon: <Tag className="w-5 h-5" /> },
  { label: 'التحليلات', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'المستخدمون', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'الوسائط', href: '/admin/media', icon: <ImageIcon className="w-5 h-5" /> },
  { label: 'النشرة البريدية', href: '/admin/newsletter', icon: <Mail className="w-5 h-5" /> },
]

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <header className={`${ibmPlexArabic.className} bg-white dark:bg-gray-800 sticky top-0 z-50`} style={{ borderBottom: '1px solid #f0f0ef' }}>
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {/* Mobile Logo */}
            <Link href="/admin" className="lg:hidden flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                حكاية AI
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="ابحث في لوحة التحكم..."
                className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                style={{ border: '1px solid #f0f0ef' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="font-medium">تعليق جديد</p>
                  <p className="text-sm text-gray-500">علق محمد أحمد على مقالك</p>
                  <p className="text-xs text-gray-400">منذ 5 دقائق</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="font-medium">مقال جديد</p>
                  <p className="text-sm text-gray-500">نشرت د. سارة مقالاً جديداً</p>
                  <p className="text-xs text-gray-400">منذ ساعة</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-purple-600 dark:text-purple-400">
                  عرض جميع الإشعارات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 dark:bg-gray-700 dark:border-gray-600"
                  style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">المدير</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 ml-2" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={() => {
                    document.cookie = 'auth-token=; max-age=0; path=/';
                    window.location.href = '/admin/login';
                  }}
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Mobile Logo */}
              <div className="mb-8">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    حكاية AI
                  </h2>
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">لوحة التحكم</p>
              </div>

              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="search"
                    placeholder="ابحث..."
                    className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ border: '1px solid #f0f0ef' }}
                  />
                </div>
              </div>

              {/* New Post Button */}
              <Link href="/admin/posts/new" className="block mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  style={{ borderRadius: '8px', boxShadow: 'none' }}
                >
                  <Plus className="w-4 h-4" />
                  مقال جديد
                </Button>
              </Link>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}