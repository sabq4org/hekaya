import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/comments - الحصول على قائمة التعليقات
export const GET = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const status = url.searchParams.get('status') as CommentStatus | null
  const postId = url.searchParams.get('postId')
  const authorId = url.searchParams.get('authorId')
  const parentId = url.searchParams.get('parentId')
  const includeReplies = url.searchParams.get('includeReplies') === 'true'
  const onlyParents = url.searchParams.get('onlyParents') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { content: { contains: filters.search, mode: 'insensitive' } },
      { author: { name: { contains: filters.search, mode: 'insensitive' } } },
      { author: { email: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }
  
  // فلترة بالحالة
  if (status) {
    where.status = status
  } else if (user.role === Role.AUTHOR) {
    // الكاتب يرى التعليقات المعتمدة فقط على مقالاته
    where.AND = [
      { status: CommentStatus.APPROVED },
      { post: { authorId: user.id } },
    ]
  }
  
  // فلترة بالمقال
  if (postId) {
    where.postId = postId
  }
  
  // فلترة بالكاتب
  if (authorId) {
    where.authorId = authorId
  }
  
  // فلترة بالتعليق الأب
  if (parentId) {
    where.parentId = parentId === 'null' ? null : parentId
  } else if (onlyParents) {
    where.parentId = null
  }
  
  // إضافة الردود إذا طُلبت
  const includeOptions: Record<string, unknown> = {
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
  }
  
  if (includeReplies) {
    includeOptions.replies = {
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
    }
    
    includeOptions._count = {
      select: { replies: true },
    }
  }
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: includeOptions,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ])
  
  return successResponse(comments, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/comments - إنشاء تعليق جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['content', 'postId'])
  
  // التحقق من وجود المقال
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { 
      id: true, 
      allowComments: true, 
      status: true,
      authorId: true,
    },
  })
  
  if (!post) {
    throw new Error('المقال غير موجود')
  }
  
  if (post.status !== 'PUBLISHED') {
    throw new Error('لا يمكن التعليق على مقال غير منشور')
  }
  
  if (!post.allowComments) {
    throw new Error('التعليقات مغلقة على هذا المقال')
  }
  
  // التحقق من التعليق الأب إذا كان موجوداً
  if (data.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { 
        id: true, 
        postId: true, 
        status: true,
        parentId: true,
      },
    })
    
    if (!parentComment) {
      throw new Error('التعليق الأب غير موجود')
    }
    
    if (parentComment.postId !== data.postId) {
      throw new Error('التعليق الأب ليس في نفس المقال')
    }
    
    if (parentComment.status !== CommentStatus.APPROVED) {
      throw new Error('لا يمكن الرد على تعليق غير معتمد')
    }
    
    // منع التداخل العميق (مستويين فقط)
    if (parentComment.parentId) {
      throw new Error('لا يمكن الرد على رد')
    }
  }
  
  // تحديد حالة التعليق
  let status = CommentStatus.PENDING
  
  // المدير والمحرر: تعليقاتهم معتمدة تلقائياً
  if (user.role === Role.ADMIN || user.role === Role.EDITOR) {
    status = CommentStatus.APPROVED
  }
  
  // كاتب المقال: تعليقه معتمد تلقائياً على مقاله
  if (user.role === Role.AUTHOR && post.authorId === user.id) {
    status = CommentStatus.APPROVED
  }
  
  // فحص السبام البسيط
  const spamKeywords = ['spam', 'viagra', 'casino', 'lottery', 'winner']
  const hasSpam = spamKeywords.some(keyword => 
    data.content.toLowerCase().includes(keyword)
  )
  
  if (hasSpam) {
    status = CommentStatus.SPAM
  }
  
  // إنشاء التعليق
  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      authorId: user.id,
      postId: data.postId,
      parentId: data.parentId || null,
      status,
      authorName: data.authorName || user.name,
      authorEmail: data.authorEmail || user.email,
      authorUrl: data.authorUrl,
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
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'COMMENT_CREATE',
    'COMMENT',
    comment.id,
    { 
      postId: data.postId,
      parentId: data.parentId,
      status,
      contentLength: data.content.length,
    }
  )
  
  return successResponse(comment, 'تم إضافة التعليق بنجاح')
})

// PATCH /api/comments/bulk - عمليات جماعية على التعليقات
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MODERATE_COMMENT)
  const { action, commentIds, data } = await request.json()
  
  validateRequired({ action, commentIds }, ['action', 'commentIds'])
  
  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    throw new Error('يجب تحديد تعليقات للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'approve':
      result = await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { 
          status: CommentStatus.APPROVED,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENTS_BULK_APPROVE',
        'COMMENT',
        undefined,
        { commentIds, count: result.count }
      )
      
      break
      
    case 'reject':
      result = await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { 
          status: CommentStatus.REJECTED,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENTS_BULK_REJECT',
        'COMMENT',
        undefined,
        { commentIds, count: result.count }
      )
      
      break
      
    case 'spam':
      result = await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { 
          status: CommentStatus.SPAM,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
      })
      
      await logApiAction(
        request,
        'COMMENTS_BULK_MARK_SPAM',
        'COMMENT',
        undefined,
        { commentIds, count: result.count }
      )
      
      break
      
    case 'delete':
      // التحقق من صلاحية الحذف
      await requirePermission(request, Permission.DELETE_COMMENT)
      
      result = await prisma.comment.deleteMany({
        where: { id: { in: commentIds } },
      })
      
      await logApiAction(
        request,
        'COMMENTS_BULK_DELETE',
        'COMMENT',
        undefined,
        { commentIds, count: result.count }
      )
      
      break
      
    case 'moveToPost':
      validateRequired(data, ['targetPostId'])
      
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
      
      result = await prisma.comment.updateMany({
        where: { id: { in: commentIds } },
        data: { 
          postId: data.targetPostId,
          parentId: null, // إزالة الربط بالتعليق الأب
        },
      })
      
      await logApiAction(
        request,
        'COMMENTS_BULK_MOVE_TO_POST',
        'COMMENT',
        undefined,
        { 
          commentIds, 
          targetPostId: data.targetPostId,
          targetPostTitle: targetPost.title,
          count: result.count,
        }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} تعليق`)
})

// DELETE /api/comments/spam - حذف جميع التعليقات المصنفة كسبام
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.DELETE_COMMENT)
  
  // حذف التعليقات المصنفة كسبام
  const result = await prisma.comment.deleteMany({
    where: { status: CommentStatus.SPAM },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'COMMENTS_DELETE_ALL_SPAM',
    'COMMENT',
    undefined,
    { deletedCount: result.count }
  )
  
  return successResponse(result, `تم حذف ${result.count} تعليق مصنف كسبام`)
})

