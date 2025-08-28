
'use client'

import { useState, useEffect } from 'react'
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
    author: { name: 'أحمد علي', image: 'https://github.com/ahmed.png' },
    content: 'مقال رائع ومفيد جداً! شكراً على هذا المحتوى القيم.',
    createdAt: '2025-08-28T10:00:00Z',
    likes: 15,
    dislikes: 1,
    replies: [
      {
        id: '1-1',
        author: { name: 'د. سارة الأحمد', image: 'https://github.com/sara.png' },
        content: 'شكراً لك يا أحمد! يسعدني أن المقال نال إعجابك.',
        createdAt: '2025-08-28T10:30:00Z',
        likes: 5,
        dislikes: 0,
      },
    ],
  },
  {
    id: '2',
    author: { name: 'فاطمة الزهراء', image: 'https://github.com/fatima.png' },
    content: 'تحليل عميق وممتاز. هل يمكنكم كتابة المزيد عن تطبيقات الذكاء الاصطناعي في مجال الصيدلة؟',
    createdAt: '2025-08-28T11:00:00Z',
    likes: 12,
    dislikes: 0,
    replies: [],
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
  onReply: (commentId: string, content: string) => void
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

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.author.image} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{comment.author.name}</span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <p className="text-gray-700 mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-blue-600">
            <ThumbsUp className="h-4 w-4" /> {comment.likes}
          </button>
          <button className="flex items-center gap-1 hover:text-red-600">
            <ThumbsDown className="h-4 w-4" /> {comment.dislikes}
          </button>
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 hover:text-gray-900"
          >
            <CornerDownRight className="h-4 w-4" /> رد
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-4">
            <Textarea 
              placeholder="اكتب ردك..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
            />
            <Button size="sm" onClick={handleReplySubmit}>إرسال الرد</Button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-r-2 border-gray-200 pr-4">
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
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState('')

  const handleCommentSubmit = () => {
    if (newComment.trim() && session?.user) {
      const comment = {
        id: Date.now().toString(),
        author: { name: session.user.name, image: session.user.image },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: [],
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
  }

  const handleReply = (commentId: string, content: string) => {
    const reply = {
      id: Date.now().toString(),
      author: { name: session?.user?.name, image: session?.user?.image },
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
    }

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...comment.replies, reply] }
      }
      return comment
    })

    setComments(updatedComments)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        التعليقات ({comments.length})
      </h3>

      {session ? (
        <div className="mb-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="أضف تعليقك..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                إرسال التعليق
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-gray-50 p-6 rounded-lg mb-6">
          <p className="mb-4">يجب تسجيل الدخول لتتمكن من إضافة تعليق.</p>
          <Button asChild>
            <Link href="/admin/login">تسجيل الدخول</Link>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} onReply={handleReply} />
        ))}
      </div>
    </div>
  )
}


