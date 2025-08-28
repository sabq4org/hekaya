'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

// Mock data - في التطبيق الحقيقي سيتم جلبها من API
const mockPosts = [
  {
    id: '1',
    title: 'الذكاء الاصطناعي في التشخيص الطبي: ثورة في دقة الكشف المبكر',
    slug: 'ai-medical-diagnosis',
    status: 'published',
    author: 'د. سارة الأحمد',
    category: 'الطب والذكاء الاصطناعي',
    publishedAt: '2025-08-28',
    views: 1234,
    comments: 23,
    excerpt: 'اكتشف كيف يحدث الذكاء الاصطناعي ثورة في التشخيص الطبي...'
  },
  {
    id: '2',
    title: 'مستقبل الذكاء الاصطناعي في التعليم',
    slug: 'ai-in-education',
    status: 'published',
    author: 'أحمد محمد',
    category: 'التعليم والتقنية',
    publishedAt: '2024-01-15',
    views: 2156,
    comments: 45,
    excerpt: 'كيف يمكن للذكاء الاصطناعي أن يحدث ثورة في طرق التعلم...'
  },
  {
    id: '3',
    title: 'أخلاقيات الذكاء الاصطناعي في العصر الحديث',
    slug: 'ai-ethics',
    status: 'draft',
    author: 'سارة أحمد',
    category: 'الأخلاقيات',
    publishedAt: null,
    views: 0,
    comments: 0,
    excerpt: 'نقاش حول التحديات الأخلاقية التي يطرحها تطور الذكاء الاصطناعي...'
  },
  {
    id: '4',
    title: 'الذكاء الاصطناعي في خدمة العملاء',
    slug: 'ai-customer-service',
    status: 'scheduled',
    author: 'محمد علي',
    category: 'الأعمال والتقنية',
    publishedAt: '2025-09-01',
    views: 0,
    comments: 0,
    excerpt: 'كيف تحول الشات بوت تجربة المستخدم وتحسن من كفاءة خدمة العملاء...'
  }
]

const statusColors = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  published: 'منشور',
  draft: 'مسودة',
  scheduled: 'مجدول',
  archived: 'مؤرشف'
}

export default function PostsManagement() {
  const [posts, setPosts] = useState(mockPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = [...new Set(posts.map(post => post.category))]

  const handleDeletePost = (postId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      setPosts(posts.filter(post => post.id !== postId))
    }
  }

  const handleStatusChange = (postId: string, newStatus: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: newStatus } : post
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المقالات</h1>
          <p className="text-gray-600 mt-1">إدارة وتحرير جميع مقالات الموقع</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            مقال جديد
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقالات</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">+2 هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقالات المنشورة</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">+1 هذا الأسبوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسودات</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">تحتاج مراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="البحث في المقالات..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="scheduled">مجدول</option>
              <option value="archived">مؤرشف</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>المقالات ({filteredPosts.length})</CardTitle>
          <CardDescription>
            قائمة بجميع المقالات مع إمكانية التحرير والإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-900">العنوان</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الكاتب</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">التصنيف</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">تاريخ النشر</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">المشاهدات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">التعليقات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {post.excerpt}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{post.author}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{post.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status as keyof typeof statusColors]}`}>
                        {statusLabels[post.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ar-SA') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{post.views.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{post.comments}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/articles/${post.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">لا توجد مقالات تطابق معايير البحث</div>
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء مقال جديد
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              مقال جديد
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Filter className="h-6 w-6 mb-2" />
              إدارة التصنيفات
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              تقارير الأداء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

