'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Trash2,
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
const comments = [
  {
    id: '1',
    author: 'محمد أحمد',
    email: 'mohammed@example.com',
    comment: 'مقال رائع جداً، شكراً على المعلومات القيمة! لقد استفدت كثيراً من الشرح المفصل حول استخدام الذكاء الاصطناعي في التشخيص الطبي.',
    post: 'الذكاء الاصطناعي في التشخيص الطبي',
    date: 'منذ 30 دقيقة',
    status: 'pending'
  },
  {
    id: '2',
    author: 'سارة علي',
    email: 'sara@example.com',
    comment: 'هل يمكن توضيح النقطة الأخيرة بشكل أكبر؟ أعتقد أن هناك حاجة لمزيد من التفاصيل حول كيفية تطبيق هذه التقنيات في المدارس.',
    post: 'مستقبل الذكاء الاصطناعي في التعليم',
    date: 'منذ ساعة',
    status: 'pending'
  },
  {
    id: '3',
    author: 'عبدالله محمد',
    email: 'abdullah@example.com',
    comment: 'أتفق معك تماماً في هذا الرأي. الأخلاقيات موضوع مهم جداً في عصر الذكاء الاصطناعي.',
    post: 'أخلاقيات الذكاء الاصطناعي',
    date: 'منذ ساعتين',
    status: 'approved'
  },
  {
    id: '4',
    author: 'فاطمة الزهراء',
    email: 'fatima@example.com',
    comment: 'شكراً على هذا المقال المفيد. هل هناك مصادر إضافية يمكن الرجوع إليها؟',
    post: 'التعلم العميق وتطبيقاته',
    date: 'منذ 3 ساعات',
    status: 'approved'
  },
  {
    id: '5',
    author: 'أحمد خالد',
    email: 'ahmed@example.com',
    comment: 'هذا المحتوى غير مناسب ويحتوي على معلومات مضللة.',
    post: 'الروبوتات الذكية في الصناعة',
    date: 'منذ 4 ساعات',
    status: 'spam'
  }
]

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.post.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || comment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="w-3 h-3" />
          موافق عليه
        </span>
      case 'pending':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3" />
          قيد المراجعة
        </span>
      case 'spam':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
          <AlertCircle className="w-3 h-3" />
          سبام
        </span>
      default:
        return null
    }
  }

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            التعليقات
          </h1>
          <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">إدارة ومراجعة التعليقات على المقالات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التعليقات</p>
                <p className="text-2xl font-bold dark:text-gray-100">{comments.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">قيد المراجعة</p>
                <p className="text-2xl font-bold dark:text-gray-100">{comments.filter(c => c.status === 'pending').length}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">موافق عليها</p>
                <p className="text-2xl font-bold dark:text-gray-100">{comments.filter(c => c.status === 'approved').length}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">سبام</p>
                <p className="text-2xl font-bold dark:text-gray-100">{comments.filter(c => c.status === 'spam').length}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
                placeholder="ابحث في التعليقات..."
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
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
                className={filterStatus === 'pending' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                قيد المراجعة
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
                className={filterStatus === 'approved' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                موافق عليها
              </Button>
              <Button
                variant={filterStatus === 'spam' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('spam')}
                className={filterStatus === 'spam' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}
                style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              >
                سبام
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700" style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold dark:text-gray-100">{comment.author}</h4>
                          {getStatusBadge(comment.status)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{comment.email}</p>
                      </div>
                    </div>

                    {/* Comment Body */}
                    <div className="ml-13">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.comment}</p>
                      
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {comment.post}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {comment.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
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
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Reply className="w-4 h-4" />
                          رد
                        </DropdownMenuItem>
                        {comment.status === 'spam' && (
                          <DropdownMenuItem className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            وضع علامة كصالح
                          </DropdownMenuItem>
                        )}
                        {comment.status !== 'spam' && (
                          <DropdownMenuItem className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            وضع علامة كسبام
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}