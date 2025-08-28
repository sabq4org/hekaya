import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/comments/[id] - الحصول على تعليق واحد
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requireAuth(request)
  const commentId = params.id
  const url = new URL(request.url)
  const includeReplies = url.searchParams.get('includeReplies') === 'true'
  
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          authorId: true,
        },
      },
      parent: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      moderator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ...(includeReplies && {
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { replies: true },
        },
      }),
    },
  })
  
  if (!comment) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الصلاحيات
  const canView = 
    // المدير والمحرر يمكنهما رؤية أي تعليق
    user.role === Role.ADMIN || user.role === Role.EDITOR ||
    // كاتب المقال يمكنه رؤية التعليقات على مقاله
    (user.role === Role.AUTHOR && comment.post.authorId === user.id) ||
    // صاحب التعليق يمكنه رؤية تعليقه
    comment.authorId === user.id ||
    // التعليقات المعتمدة يمكن للجميع رؤيتها
    comment.status === CommentStatus.APPROVED
  
  if (!canView) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  return successResponse(comment)
})

// PUT /api/comments/[id] - تحديث تعليق
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requireAuth(request)
  const data = await request.json()
  const commentId = params.id
  
  // البحث عن التعليق
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        select: { authorId: true },
      },
    },
  })
  
  if (!existingComment) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الصلاحيات
  const canEdit = 
    // المدير والمحرر يمكنهما تعديل أي تعليق
    user.role === Role.ADMIN || user.role === Role.EDITOR ||
    // صاحب التعليق يمكنه تعديل تعليقه (خلال 15 دقيقة)
    (existingComment.authorId === user.id && 
     new Date().getTime() - existingComment.createdAt.getTime() < 15 * 60 * 1000)
  
  if (!canEdit) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  // إعداد البيانات للتحديث
  const updateData: Record<string, unknown> = {}
  
  if (data.content) updateData.content = data.content
  if (data.authorName !== undefined) updateData.authorName = data.authorName
  if (data.authorEmail !== undefined) updateData.authorEmail = data.authorEmail
  if (data.authorUrl !== undefined) updateData.authorUrl = data.authorUrl
  
  // المدير والمحرر يمكنهما تغيير الحالة
  if ((user.role === Role.ADMIN || user.role === Role.EDITOR) && data.status) {
    updateData.status = data.status
    updateData.moderatedAt = new Date()
    updateData.moderatedBy = user.id
  }
  
  // تحديث التعليق
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      parent: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      moderator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'COMMENT_UPDATE',
    'COMMENT',
    updatedComment.id,
    { 
      changes: Object.keys(updateData),
      oldStatus: existingComment.status,
      newStatus: updatedComment.status,
    }
  )
  
  return successResponse(updatedComment, 'تم تحديث التعليق بنجاح')
})

// DELETE /api/comments/[id] - حذف تعليق
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requireAuth(request)
  const commentId = params.id
  
  // البحث عن التعليق
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        select: { authorId: true },
      },
      _count: {
        select: { replies: true },
      },
    },
  })
  
  if (!comment) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الصلاحيات
  const canDelete = 
    // المدير والمحرر يمكنهما حذف أي تعليق
    user.role === Role.ADMIN || user.role === Role.EDITOR ||
    // صاحب التعليق يمكنه حذف تعليقه (إذا لم يكن له ردود)
    (comment.authorId === user.id && comment._count.replies === 0) ||
    // كاتب المقال يمكنه حذف التعليقات على مقاله
    (user.role === Role.AUTHOR && comment.post.authorId === user.id)
  
  if (!canDelete) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  // حذف التعليق (سيحذف الردود تلقائياً)
  await prisma.comment.delete({
    where: { id: commentId },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'COMMENT_DELETE',
    'COMMENT',
    commentId,
    { 
      postId: comment.postId,
      parentId: comment.parentId,
      status: comment.status,
      repliesCount: comment._count.replies,
    }
  )
  
  return successResponse(null, 'تم حذف التعليق بنجاح')
})

// PATCH /api/comments/[id] - عمليات خاصة على التعليق
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requireAuth(request)
  const { action, data } = await request.json()
  const commentId = params.id
  
  validateRequired({ action }, ['action'])
  
  // البحث عن التعليق
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        select: { authorId: true },
      },
    },
  })
  
  if (!comment) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  let result
  
  switch (action) {
    case 'approve':
      // التحقق من صلاحية الاعتماد
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: {
          status: CommentStatus.APPROVED,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_APPROVE',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'reject':
      // التحقق من صلاحية الرفض
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: {
          status: CommentStatus.REJECTED,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_REJECT',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'markSpam':
      // التحقق من صلاحية تصنيف السبام
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: {
          status: CommentStatus.SPAM,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_MARK_SPAM',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'unmarkSpam':
      // التحقق من صلاحية إلغاء تصنيف السبام
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: {
          status: CommentStatus.PENDING,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_UNMARK_SPAM',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'pin':
      // التحقق من صلاحية التثبيت
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR && 
          comment.post.authorId !== user.id) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: { isPinned: true },
      })
      
      await logApiAction(
        request,
        'COMMENT_PIN',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'unpin':
      // التحقق من صلاحية إلغاء التثبيت
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR && 
          comment.post.authorId !== user.id) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: { isPinned: false },
      })
      
      await logApiAction(
        request,
        'COMMENT_UNPIN',
        'COMMENT',
        commentId,
        { postId: comment.postId }
      )
      
      break
      
    case 'reply':
      validateRequired(data, ['content'])
      
      // التحقق من أن التعليق معتمد
      if (comment.status !== CommentStatus.APPROVED) {
        throw new Error('لا يمكن الرد على تعليق غير معتمد')
      }
      
      // التحقق من أن التعليق ليس رداً (منع التداخل العميق)
      if (comment.parentId) {
        throw new Error('لا يمكن الرد على رد')
      }
      
      // إنشاء الرد
      result = await prisma.comment.create({
        data: {
          content: data.content,
          authorId: user.id,
          postId: comment.postId,
          parentId: commentId,
          status: user.role === Role.ADMIN || user.role === Role.EDITOR || 
                  comment.post.authorId === user.id ? 
                  CommentStatus.APPROVED : CommentStatus.PENDING,
          authorName: user.name,
          authorEmail: user.email,
          userAgent: request.headers.get('user-agent') || '',
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_REPLY',
        'COMMENT',
        result.id,
        { 
          parentId: commentId,
          postId: comment.postId,
          contentLength: data.content.length,
        }
      )
      
      break
      
    case 'moveToPost':
      validateRequired(data, ['targetPostId'])
      
      // التحقق من صلاحية النقل
      if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      // التحقق من وجود المقال المستهدف
      const targetPost = await prisma.post.findUnique({
        where: { id: data.targetPostId },
        select: { id: true, title: true, allowComments: true },
      })
      
      if (!targetPost) {
        throw new Error('المقال المستهدف غير موجود')
      }
      
      if (!targetPost.allowComments) {
        throw new Error('التعليقات مغلقة على المقال المستهدف')
      }
      
      result = await prisma.comment.update({
        where: { id: commentId },
        data: { 
          postId: data.targetPostId,
          parentId: null, // إزالة الربط بالتعليق الأب
        },
      })
      
      await logApiAction(
        request,
        'COMMENT_MOVE_TO_POST',
        'COMMENT',
        commentId,
        { 
          oldPostId: comment.postId,
          newPostId: data.targetPostId,
          targetPostTitle: targetPost.title,
        }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, 'تم تنفيذ العملية بنجاح')
})

