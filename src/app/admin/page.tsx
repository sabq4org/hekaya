'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Eye, 
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  Calendar,
  User,
  Tag,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Star,
  Bookmark,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// Mock data
const stats = [
  {
    title: 'إجمالي المقالات',
    value: '42',
    change: '+12%',
    trend: 'up',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900'
  },
  {
    title: 'التعليقات الأخيرة',
    value: '328',
    change: '+8%',
    trend: 'up',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900'
  },
  {
    title: 'المستخدمون النشطون',
    value: '1,241',
    change: '+24%',
    trend: 'up',
    icon: <Users className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900'
  },
  {
    title: 'مشاهدات اليوم',
    value: '3.2k',
    change: '-5%',
    trend: 'down',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900'
  }
]

const recentPosts = [
  {
    id: '1',
    title: 'الذكاء الاصطناعي في التشخيص الطبي',
    author: 'د. سارة الأحمد',
    date: 'منذ 3 ساعات',
    views: 234,
    comments: 12,
    status: 'published',
    category: 'الطب والصحة'
  },
  {
    id: '2',
    title: 'مستقبل الذكاء الاصطناعي في التعليم',
    author: 'أحمد محمد',
    date: 'منذ 5 ساعات',
    views: 156,
    comments: 8,
    status: 'draft',
    category: 'التعليم'
  },
  {
    id: '3',
    title: 'أخلاقيات الذكاء الاصطناعي',
    author: 'د. فاطمة الزهراء',
    date: 'منذ يوم واحد',
    views: 542,
    comments: 23,
    status: 'published',
    category: 'التقنية'
  }
]

const recentComments = [
  {
    id: '1',
    author: 'محمد أحمد',
    comment: 'مقال رائع جداً، شكراً على المعلومات القيمة!',
    post: 'الذكاء الاصطناعي في التشخيص الطبي',
    date: 'منذ 30 دقيقة',
    status: 'approved'
  },
  {
    id: '2',
    author: 'سارة علي',
    comment: 'هل يمكن توضيح النقطة الأخيرة بشكل أكبر؟',
    post: 'مستقبل الذكاء الاصطناعي في التعليم',
    date: 'منذ ساعة',
    status: 'pending'
  },
  {
    id: '3',
    author: 'عبدالله محمد',
    comment: 'أتفق معك تماماً في هذا الرأي',
    post: 'أخلاقيات الذكاء الاصطناعي',
    date: 'منذ ساعتين',
    status: 'approved'
  }
]

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            نظرة عامة
          </h1>
          <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في لوحة التحكم، إليك آخر التحديثات</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index}
            className="bg-white dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1 dark:text-gray-100">{stat.value}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <Card 
          className="bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl dark:text-gray-100">المقالات الأخيرة</CardTitle>
                <CardDescription className="dark:text-gray-400">آخر المقالات المنشورة والمسودات</CardDescription>
              </div>
              <Link href="/admin/posts/new">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                  style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
                >
                  <Plus className="w-4 h-4" />
                  مقال جديد
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                style={{ border: '1px solid #f0f0ef' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold dark:text-gray-100">{post.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {post.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {post.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/posts/${post.id}/edit`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link href="/admin/posts" className="block">
              <Button 
                variant="outline" 
                className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                عرض جميع المقالات
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card 
          className="bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl dark:text-gray-100">التعليقات الأخيرة</CardTitle>
                <CardDescription className="dark:text-gray-400">التعليقات التي تحتاج إلى مراجعة</CardDescription>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-sm rounded-full">
                {recentComments.filter(c => c.status === 'pending').length} جديد
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentComments.map((comment) => (
              <div 
                key={comment.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                style={{ border: '1px solid #f0f0ef' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold dark:text-gray-100">{comment.author}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
                      {comment.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">{comment.comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      على: <span className="font-medium">{comment.post}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {comment.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Link href="/admin/comments" className="block">
              <Button 
                variant="outline" 
                className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                إدارة جميع التعليقات
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card 
        className="mt-8 bg-white dark:bg-gray-800 dark:border-gray-700"
        style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
      >
        <CardHeader>
          <CardTitle className="dark:text-gray-100">إجراءات سريعة</CardTitle>
          <CardDescription className="dark:text-gray-400">اختصارات للمهام الشائعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/posts/new">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="font-semibold">مقال جديد</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">أنشئ محتوى جديد</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/admin/categories">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-right">
                  <p className="font-semibold">التصنيفات</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">إدارة التصنيفات</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/admin/analytics">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <p className="font-semibold">التحليلات</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">عرض الإحصائيات</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/admin/settings">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-right">
                  <p className="font-semibold">الإعدادات</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">إعدادات الموقع</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}