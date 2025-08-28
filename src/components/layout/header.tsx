"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Search, Menu, X, Sparkles } from "lucide-react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const navigation = [
    { name: "الرئيسية", href: "/" },
    { name: "المقالات", href: "/blog" },
    { name: "عن الموقع", href: "/about" },
    { name: "تواصل", href: "/contact" },
  ]

  return (
    <header 
      className={`sticky top-0 z-50 w-full ${ibmPlexArabic.className} dark:bg-gray-900`}
      style={{ 
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderBottom: isDark ? '1px solid #333' : '1px solid #f0f0ef'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              حكاية AI
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group"
              >
                {item.name}
                <span 
                  className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-purple-600 dark:bg-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button 
              variant="outline" 
              size="icon"
              style={{ 
                borderColor: isDark ? '#333' : '#f0f0ef',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                boxShadow: 'none'
              }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">بحث</span>
            </Button>

            {/* Theme Toggle */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              style={{ 
                borderColor: isDark ? '#333' : '#f0f0ef',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                boxShadow: 'none'
              }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
              <span className="sr-only">تبديل الوضع</span>
            </Button>

            {/* Login/Subscribe Button */}
            <Button 
              variant="outline"
              className="hidden md:flex items-center gap-2 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{ 
                borderColor: isDark ? '#333' : '#f0f0ef',
                borderWidth: '1px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                boxShadow: 'none'
              }}
            >
              <span className="text-sm">ابدأ الكتابة</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                borderColor: isDark ? '#333' : '#f0f0ef',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                boxShadow: 'none'
              }}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
              <span className="sr-only">القائمة</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: isDark ? '1px solid #333' : '1px solid #f0f0ef' }}>
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-4" style={{ borderTop: isDark ? '1px solid #333' : '1px solid #f0f0ef' }}>
                <Button 
                  variant="outline" 
                  className="w-full dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ 
                    borderColor: isDark ? '#333' : '#f0f0ef',
                    borderWidth: '1px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                    boxShadow: 'none'
                  }}
                >
                  <span className="text-sm">ابدأ الكتابة</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}