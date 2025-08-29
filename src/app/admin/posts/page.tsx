'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Search, 
  Eye,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  CheckCircle,
  Clock,
  Sparkles
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

interface Post {
  id: string
  title: string
  slug: string
  summary?: string
  status: string
  publishedAt: string | null
  viewCount: number
  likes: number
  coverImage?: string
  author: {
    id: string
    name: string
    email: string
    image?: string
  }
  section?: {
    id: string
    name: string
    slug: string
    color?: string
  }
  _count: {
    comments: number
  }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      if (data.success && data.data) {
        // API returns posts array directly in data.data
        setPosts(data.data)
      } else {
        console.error('فشل جلب المقالات:', data.error)
        setPosts([])
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // إزالة المقال من القائمة المحلية
        setPosts(posts.filter(p => p.id !== postId))
        alert('تم حذف المقال بنجاح')
      } else {
        alert('فشل حذف المقال')
      }
    } catch (error) {
      console.error('خطأ في حذف المقال:', error)
      alert('حدث خطأ أثناء حذف المقال')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="w-3 h-3" />
          منشور
        </span>
      case 'DRAFT':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3" />
          مسودة
        </span>
      case 'SCHEDULED':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <Calendar className="w-3 h-3" />
          مجدول
        </span>
      default:
        return null
    }
  }

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              المقالات
            </h1>
            <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
          </div>
          <Link href="/admin/posts/new">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" style={{ borderRadius: '8px', boxShadow: 'none' }}>
              <Plus className="w-4 h-4" />
              مقال جديد
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">إدارة وتحرير جميع المقالات المنشورة والمسودات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المقالات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{posts.length}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">المقالات المنشورة</p>
                <p className="text-2xl font-bold dark:text-gray-100">{posts.filter(p => p.status === 'PUBLISHED').length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المسودات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{posts.filter(p => p.status === 'DRAFT').length}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{posts.reduce((acc, p) => acc + (p.viewCount || 0), 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                style={{ border: '1px solid #f0f0ef' }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                الكل
              </Button>
              <Button
                variant={filterStatus === 'PUBLISHED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('PUBLISHED')}
                className={filterStatus === 'PUBLISHED' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                منشور
              </Button>
              <Button
                variant={filterStatus === 'DRAFT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('DRAFT')}
                className={filterStatus === 'DRAFT' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                مسودة
              </Button>
              <Button
                variant={filterStatus === 'SCHEDULED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('SCHEDULED')}
                className={filterStatus === 'SCHEDULED' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                مجدول
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">جاري تحميل المقالات...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">لا توجد مقالات</p>
            </div>
          ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0 overflow-hidden">
                    {post.coverImage && (
                      <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold dark:text-gray-100">
                            <Link href={`/admin/posts/${post.id}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                              {post.title}
                            </Link>
                          </h3>
                          {getStatusBadge(post.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author?.name || 'غير معروف'}
                          </span>
                          {post.section && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {post.section.name}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.publishedAt).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                          {post.status === 'PUBLISHED' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {(post.viewCount || 0).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post._count?.comments || 0}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/posts/${post.id}`} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              تحرير
                            </Link>
                          </DropdownMenuItem>
                          {post.status === 'PUBLISHED' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/articles/${post.slug}`} className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                عرض
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-red-600 dark:text-red-400"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}