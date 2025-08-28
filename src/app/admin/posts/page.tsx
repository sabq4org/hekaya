'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Search, 
  Filter,
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

// Mock data
const posts = [
  {
    id: '1',
    title: 'الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر',
    slug: 'ai-medical-diagnosis',
    author: 'د. سارة الأحمد',
    category: 'الطب والصحة',
    status: 'published',
    publishedAt: '2024-08-28',
    views: 1234,
    comments: 23,
    image: '/images/ai-medical.jpg'
  },
  {
    id: '2',
    title: 'مستقبل الذكاء الاصطناعي في التعليم',
    slug: 'future-of-ai-in-education',
    author: 'أحمد محمد',
    category: 'التعليم',
    status: 'draft',
    publishedAt: null,
    views: 0,
    comments: 0,
    image: '/images/ai-education.jpg'
  },
  {
    id: '3',
    title: 'أخلاقيات الذكاء الاصطناعي في العصر الرقمي',
    slug: 'ai-ethics',
    author: 'د. فاطمة الزهراء',
    category: 'التقنية',
    status: 'published',
    publishedAt: '2024-01-10',
    views: 2542,
    comments: 45,
    image: '/images/ai-ethics.jpg'
  },
  {
    id: '4',
    title: 'التعلم العميق وتطبيقاته في معالجة الصور',
    slug: 'deep-learning-image-processing',
    author: 'م. خالد العمري',
    category: 'التقنية',
    status: 'published',
    publishedAt: '2024-01-05',
    views: 1876,
    comments: 31,
    image: '/images/deep-learning.jpg'
  },
  {
    id: '5',
    title: 'الروبوتات الذكية في الصناعة',
    slug: 'smart-robots-industry',
    author: 'د. ليلى حسن',
    category: 'الصناعة',
    status: 'scheduled',
    publishedAt: '2024-02-01',
    views: 0,
    comments: 0,
    image: '/images/robots.jpg'
  }
]

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="w-3 h-3" />
          منشور
        </span>
      case 'draft':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3" />
          مسودة
        </span>
      case 'scheduled':
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
                <p className="text-2xl font-bold dark:text-gray-100">{posts.filter(p => p.status === 'published').length}</p>
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
                <p className="text-2xl font-bold dark:text-gray-100">{posts.filter(p => p.status === 'draft').length}</p>
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
                <p className="text-2xl font-bold dark:text-gray-100">{posts.reduce((acc, p) => acc + p.views, 0).toLocaleString()}</p>
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
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('published')}
                className={filterStatus === 'published' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                منشور
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
                className={filterStatus === 'draft' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                مسودة
              </Button>
              <Button
                variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('scheduled')}
                className={filterStatus === 'scheduled' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
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
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0 overflow-hidden">
                    {post.image && (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold dark:text-gray-100">
                            <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-purple-600 dark:hover:text-purple-400">
                              {post.title}
                            </Link>
                          </h3>
                          {getStatusBadge(post.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {post.category}
                          </span>
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.publishedAt).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                          {post.status === 'published' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments}
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
                            <Link href={`/admin/posts/${post.id}/edit`} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              تحرير
                            </Link>
                          </DropdownMenuItem>
                          {post.status === 'published' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/articles/${post.slug}`} className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                عرض
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600 dark:text-red-400">
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
        </CardContent>
      </Card>
    </div>
  )
}