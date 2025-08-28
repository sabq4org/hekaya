'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageCircle, Send, ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react'

// Mock data - سيتم استبدالها ببيانات حقيقية من API
const mockComments = [
  {
    id: '1',
    author: { name: 'أحمد محمد', image: '/images/avatars/user1.jpg' },
    content: 'مقال رائع ومفيد جداً! شكراً لكم على هذا المحتوى القيم.',
    createdAt: '2024-01-15T10:30:00Z',
    likes: 15,
    dislikes: 2,
    replies: [
      {
        id: '2',
        author: { name: 'فاطمة أحمد', image: '/images/avatars/user2.jpg' },
        content: 'أتفق معك تماماً، المعلومات مفيدة جداً.',
        createdAt: '2024-01-15T11:15:00Z',
        likes: 8,
        dislikes: 0
      }
    ]
  },
  {
    id: '3',
    author: { name: 'عبدالرحمن السعدي', image: '/images/avatars/user3.jpg' },
    content: 'هل يمكن أن تشاركوا المزيد من الأمثلة العملية؟',
    createdAt: '2024-01-15T14:20:00Z',
    likes: 12,
    dislikes: 1,
    replies: []
  },
]

interface CommentProps {
  comment: {
    id: string
    content: string
    author: { name: string }
    createdAt: Date
    replies?: CommentProps['comment'][]
  }
  onReply: (parentId: string, content: string) => void
}

function Comment({ comment, onReply }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="/images/default-avatar.png" alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{comment.author.name}</span>
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 text-gray-700 leading-relaxed">{comment.content}</p>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
            <ThumbsUp className="h-4 w-4" />
          </button>
          
          <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
            <ThumbsDown className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <CornerDownRight className="h-4 w-4" />
            <span>رد</span>
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Textarea 
              placeholder="اكتب ردك هنا..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReplySubmit}>
                <Send className="h-4 w-4 mr-2" />
                إرسال
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentsSectionProps {
  postId: string
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments] = useState(mockComments)
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    // Handle comment submission
    console.log('Submit comment for post:', postId)
    setNewComment('')
  }

  const handleReply = (parentId: string, content: string) => {
    // Handle reply submission
    console.log('Reply to comment:', parentId, content)
  }

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="h-6 w-6 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          التعليقات ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        {session ? (
          <div>
            <div className="flex gap-4 mb-4">
              <Avatar>
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'أنت'} />
                <AvatarFallback>{session.user?.name?.charAt(0) || 'أ'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-2">
                  {session.user?.name}
                </p>
                <Textarea
                  placeholder="شاركنا رأيك أو تعليقك..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                نشر التعليق
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              يجب تسجيل الدخول لإضافة تعليق
            </p>
            <Link href="/admin/login">
              <Button>تسجيل الدخول</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment 
            key={comment.id} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            comment={comment as any} 
            onReply={handleReply} 
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            لا توجد تعليقات بعد. كن أول من يشارك رأيه!
          </p>
        </div>
      )}
    </section>
  )
}


