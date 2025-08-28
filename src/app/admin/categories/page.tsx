'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Tag,
  Plus,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  MoreVertical,
  Sparkles,
  Hash,
  Palette
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// Mock data
const categories = [
  {
    id: '1',
    name: 'الطب والصحة',
    slug: 'medicine-health',
    description: 'مقالات حول تطبيقات الذكاء الاصطناعي في المجال الطبي والصحي',
    color: '#3B82F6',
    posts: 12,
    views: 3420
  },
  {
    id: '2',
    name: 'التعليم',
    slug: 'education',
    description: 'استخدامات الذكاء الاصطناعي في تطوير التعليم والتعلم',
    color: '#10B981',
    posts: 8,
    views: 2150
  },
  {
    id: '3',
    name: 'التقنية',
    slug: 'technology',
    description: 'آخر التطورات والابتكارات في عالم الذكاء الاصطناعي',
    color: '#8B5CF6',
    posts: 15,
    views: 5230
  },
  {
    id: '4',
    name: 'الصناعة',
    slug: 'industry',
    description: 'تطبيقات الذكاء الاصطناعي في القطاع الصناعي',
    color: '#F59E0B',
    posts: 5,
    views: 1820
  },
  {
    id: '5',
    name: 'الأعمال',
    slug: 'business',
    description: 'كيف يحول الذكاء الاصطناعي عالم الأعمال',
    color: '#EF4444',
    posts: 7,
    views: 2890
  }
]

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              التصنيفات
            </h1>
            <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
          </div>
          <Button 
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            style={{ borderRadius: '8px', boxShadow: 'none' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            تصنيف جديد
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">إدارة تصنيفات المقالات وتنظيم المحتوى</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التصنيفات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{categories.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المقالات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{categories.reduce((acc, cat) => acc + cat.posts, 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{categories.reduce((acc, cat) => acc + cat.views, 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="ابحث في التصنيفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              style={{ border: '1px solid #f0f0ef' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card 
            key={category.id}
            className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Tag className="w-6 h-6" style={{ color: category.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg dark:text-gray-100">{category.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.slug}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      تحرير
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{category.description}</p>
              
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #f0f0ef' }}>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    {category.posts} مقال
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    {category.views.toLocaleString()} مشاهدة
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Category Modal (Placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <Card 
            className="w-full max-w-md bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">إضافة تصنيف جديد</CardTitle>
              <CardDescription className="dark:text-gray-400">أضف تصنيفاً جديداً لتنظيم المقالات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">اسم التصنيف</label>
                <input
                  type="text"
                  placeholder="مثال: الذكاء الاصطناعي التوليدي"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">الوصف</label>
                <textarea
                  placeholder="وصف مختصر للتصنيف..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">اللون</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  style={{ borderRadius: '8px', boxShadow: 'none' }}
                >
                  إضافة التصنيف
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                  style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}