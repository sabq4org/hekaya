
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  Eye, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockComments = [
  {
    id: '1',
    author: { name: 'أحمد علي', email: 'ahmed@example.com' },
    content: 'مقال رائع ومفيد جداً! شكراً على هذا المحتوى القيم.',
    post: { id: '1', title: 'الذكاء الاصطناعي في التشخيص الطبي' },
    status: 'approved',
    createdAt: '2025-08-28T10:00:00Z',
    likes: 15,
    dislikes: 1
  },
  {
    id: '2',
    author: { name: 'فاطمة الزهراء', email: 'fatima@example.com' },
    content: 'تحليل عميق وممتاز. هل يمكنكم كتابة المزيد عن تطبيقات الذكاء الاصطناعي في مجال الصيدلة؟',
    post: { id: '1', title: 'الذكاء الاصطناعي في التشخيص الطبي' },
    status: 'approved',
    createdAt: '2025-08-28T11:00:00Z',
    likes: 12,
    dislikes: 0
  },
  {
    id: '3',
    author: { name: 'خالد عبدالله', email: 'khaled@example.com' },
    content: 'مقال جيد، لكن أعتقد أن هناك بعض المبالغة في تقدير قدرات الذكاء الاصطناعي الحالية.',
    post: { id: '2', title: 'مستقبل الذكاء الاصطناعي في التعليم' },
    status: 'pending',
    createdAt: '2025-08-29T09:00:00Z',
    likes: 2,
    dislikes: 3
  },
  {
    id: '4',
    author: { name: 'مستخدم مجهول', email: 'spam@example.com' },
    content: 'زوروا موقعنا للحصول على خصومات رائعة! www.example.com',
    post: { id: '1', title: 'الذكاء الاصطناعي في التشخيص الطبي' },
    status: 'spam',
    createdAt: '2025-08-29T12:00:00Z',
    likes: 0,
    dislikes: 0
  }
]

const statusColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  spam: 'bg-red-100 text-red-800',
  trash: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  approved: 'مقبول',
  pending: 'قيد المراجعة',
  spam: 'مزعج',
  trash: 'محذوف'
}

const statusIcons = {
  approved: <CheckCircle className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  spam: <XCircle className="h-4 w-4" />,
  trash: <Trash2 className="h-4 w-4" />
}

export default function CommentsManagement() {
  const [comments, setComments] = useState(mockComments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (commentId: string, newStatus: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId ? { ...comment, status: newStatus } : comment
    ))
  }

  const handleDelete = (commentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التعليق نهائياً؟')) {
      setComments(comments.filter(comment => comment.id !== commentId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة التعليقات</h1>
          <p className="text-gray-600 mt-1">مراجعة وإدارة جميع تعليقات الموقع</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التعليقات</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
            <p className="text-xs text-muted-foreground">+5 هذا اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التعليقات المقبولة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comments.filter(c => c.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">+2 هذا اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comments.filter(c => c.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">تحتاج إلى إجراء</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التعليقات المزعجة</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comments.filter(c => c.status === 'spam').length}
            </div>
            <p className="text-xs text-muted-foreground">تم حظرها تلقائياً</p>
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
                  placeholder="البحث في التعليقات..."
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
              <option value="approved">مقبول</option>
              <option value="pending">قيد المراجعة</option>
              <option value="spam">مزعج</option>
              <option value="trash">محذوف</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>التعليقات ({filteredComments.length})</CardTitle>
          <CardDescription>
            قائمة بجميع التعليقات مع إمكانية المراجعة والإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-900">التعليق</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الكاتب</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">المقال</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">التاريخ</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {comment.likes}</span>
                        <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> {comment.dislikes}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{comment.author.name}</div>
                      <div className="text-sm text-gray-500">{comment.author.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/articles/${comment.post.id}`} className="text-sm text-blue-600 hover:underline">
                        {comment.post.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[comment.status as keyof typeof statusColors]}`}>
                        {statusIcons[comment.status as keyof typeof statusIcons]}
                        {statusLabels[comment.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(comment.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        {comment.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(comment.id, 'approved')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(comment.id, 'spam')}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
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

          {filteredComments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              لا توجد تعليقات تطابق معايير البحث
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


