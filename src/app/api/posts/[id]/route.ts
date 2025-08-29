import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requireAuth,
  ApiErrors,
  createSlug,
  logApiAction,
} from '@/lib/api-helpers'
import { Permission, canEditPost, canDeletePost } from '@/lib/permissions'
import { Role, PostStatus } from '@prisma/client'

// GET /api/posts/[id] - الحصول على مقال واحد
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const postId = params.id
  
  // البحث بالـ ID أو الـ slug
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { id: postId },
        { slug: postId },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
      section: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          description: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              description: true,
            },
          },
        },
      },
      comments: {
        where: { status: 'APPROVED' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            where: { status: 'APPROVED' },
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
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          comments: {
            where: { status: 'APPROVED' }
          },
        },
      },
    },
  })
  
  if (!post) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الصلاحيات للمقالات غير المنشورة
  if (post.status !== PostStatus.PUBLISHED) {
    try {
      const user = await requireAuth(request)
      
      // المدير والمحرر يمكنهما رؤية أي مقال
      // الكاتب يمكنه رؤية مقالاته فقط
      if (user.role === Role.AUTHOR && post.authorId !== user.id) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
    } catch {
      // الزوار لا يمكنهم رؤية المقالات غير المنشورة
      throw new Error(ApiErrors.NOT_FOUND)
    }
  }
  
  // زيادة عداد المشاهدات للمقالات المنشورة
  if (post.status === PostStatus.PUBLISHED) {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
  }
  
  // تنسيق البيانات
  const formattedPost = {
    ...post,
    tags: post.tags.map(pt => pt.tag),
    commentsCount: post._count.comments,
    likesCount: post.likes,
    _count: undefined,
  }
  
  return successResponse(formattedPost)
})




// PUT /api/posts/[id] - تحديث مقال
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requirePermission(request, Permission.UPDATE_POST)
  const data = await request.json()
  const postId = params.id
  
  // البحث عن المقال
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  })
  
  if (!existingPost) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من صلاحية التعديل
  if (!canEditPost(user.role as Role, existingPost.authorId, user.id, existingPost.status)) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  // إعداد البيانات للتحديث
  const updateData: Record<string, unknown> = {}
  
  if (data.title) updateData.title = data.title
  if (data.summary) updateData.summary = data.summary
  if (data.content) updateData.content = data.content
  if (data.contentText) updateData.contentText = data.contentText
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
  if (data.coverAlt !== undefined) updateData.coverAlt = data.coverAlt
  if (data.sectionId) updateData.sectionId = data.sectionId
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription
  if (data.ogImage !== undefined) updateData.ogImage = data.ogImage
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned
  if (data.allowComments !== undefined) updateData.allowComments = data.allowComments
  if (data.scheduledFor !== undefined) {
    updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null
  }
  
  // تحديث الـ slug إذا تغير العنوان
  if (data.title && data.title !== existingPost.title) {
    const newSlug = data.slug || createSlug(data.title)
    
    // التأكد من أن الـ slug فريد
    const slugExists = await prisma.post.findFirst({
      where: {
        slug: newSlug,
        id: { not: postId },
      },
    })
    
    if (slugExists) {
      updateData.slug = `${newSlug}-${Date.now()}`
    } else {
      updateData.slug = newSlug
    }
  }
  
  // حساب وقت القراءة إذا تغير المحتوى
  if (data.contentText) {
    const wordsPerMinute = 200
    const wordCount = data.contentText.split(/\s+/).length
    updateData.readingTime = Math.ceil(wordCount / wordsPerMinute)
  }
  
  // تحديث الحالة والنشر
  if (data.status && data.status !== existingPost.status) {
    updateData.status = data.status
    
    // إذا تم النشر لأول مرة
    if (data.status === PostStatus.PUBLISHED && !existingPost.publishedAt) {
      updateData.publishedAt = new Date()
    }
    
    // إذا تم الأرشفة
    if (data.status === PostStatus.ARCHIVED) {
      updateData.archivedAt = new Date()
    }
  }
  
  // تحديث المقال
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      section: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  })
  
  // تحديث الوسوم إذا تم تمريرها
  if (data.tagIds !== undefined && Array.isArray(data.tagIds)) {
    // حذف الوسوم الحالية
    await prisma.postTag.deleteMany({
      where: { postId },
    })
    
    // تقليل عداد الوسوم القديمة
    const oldTagIds = existingPost.tags.map(pt => pt.tagId)
    if (oldTagIds.length > 0) {
      await prisma.tag.updateMany({
        where: { id: { in: oldTagIds } },
        data: { usageCount: { decrement: 1 } },
      })
    }
    
    // إضافة الوسوم الجديدة
    if (data.tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: data.tagIds.map((tagId: string) => ({
          postId,
          tagId,
        })),
        skipDuplicates: true,
      })
      
      // زيادة عداد الوسوم الجديدة
      await prisma.tag.updateMany({
        where: { id: { in: data.tagIds } },
        data: { usageCount: { increment: 1 } },
      })
    }
  }
  
  // تسجيل العملية
  await logApiAction(
    request,
    'POST_UPDATE',
    'POST',
    updatedPost.id,
    { 
      title: updatedPost.title, 
      changes: Object.keys(updateData),
      oldStatus: existingPost.status,
      newStatus: updatedPost.status,
    }
  )
  
  return successResponse(updatedPost, 'تم تحديث المقال بنجاح')
})

// DELETE /api/posts/[id] - حذف مقال
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requirePermission(request, Permission.DELETE_POST)
  const postId = params.id
  
  // البحث عن المقال
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  })
  
  if (!post) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من صلاحية الحذف
  if (!canDeletePost(user.role as Role, post.authorId, user.id)) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  // تقليل عداد استخدام الوسوم
  const tagIds = post.tags.map(pt => pt.tagId)
  if (tagIds.length > 0) {
    await prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: { usageCount: { decrement: 1 } },
    })
  }
  
  // حذف المقال (سيحذف التعليقات والوسوم المرتبطة تلقائياً)
  await prisma.post.delete({
    where: { id: postId },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'POST_DELETE',
    'POST',
    postId,
    { title: post.title, status: post.status }
  )
  
  return successResponse(null, 'تم حذف المقال بنجاح')
})

// PATCH /api/posts/[id] - عمليات خاصة على المقال
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await await requireAuth(request)
  const { action, data } = await request.json()
  const postId = params.id
  
  validateRequired({ action }, ['action'])
  
  // البحث عن المقال
  const post = await prisma.post.findUnique({
    where: { id: postId },
  })
  
  if (!post) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  let result
  
  switch (action) {
    case 'publish':
      // التحقق من صلاحية النشر
      if (!canEditPost(user.role as Role, post.authorId, user.id, post.status)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'POST_PUBLISH',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'unpublish':
      // التحقق من صلاحية إلغاء النشر
      if (!canEditPost(user.role as Role, post.authorId, user.id, post.status)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.DRAFT,
        },
      })
      
      await logApiAction(
        request,
        'POST_UNPUBLISH',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'archive':
      // التحقق من صلاحية الأرشفة
      if (!canEditPost(user.role as Role, post.authorId, user.id, post.status)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.ARCHIVED,
          archivedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'POST_ARCHIVE',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'restore':
      // التحقق من صلاحية الاستعادة
      if (!canEditPost(user.role as Role, post.authorId, user.id, post.status)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.DRAFT,
          archivedAt: null,
        },
      })
      
      await logApiAction(
        request,
        'POST_RESTORE',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'feature':
      // المدير والمحرر فقط يمكنهما تمييز المقالات
      await requirePermission(request, Permission.UPDATE_POST)
      
      result = await prisma.post.update({
        where: { id: postId },
        data: { isFeatured: true },
      })
      
      await logApiAction(
        request,
        'POST_FEATURE',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'unfeature':
      // المدير والمحرر فقط يمكنهما إلغاء تمييز المقالات
      await requirePermission(request, Permission.UPDATE_POST)
      
      result = await prisma.post.update({
        where: { id: postId },
        data: { isFeatured: false },
      })
      
      await logApiAction(
        request,
        'POST_UNFEATURE',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'pin':
      // المدير والمحرر فقط يمكنهما تثبيت المقالات
      await requirePermission(request, Permission.UPDATE_POST)
      
      result = await prisma.post.update({
        where: { id: postId },
        data: { isPinned: true },
      })
      
      await logApiAction(
        request,
        'POST_PIN',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'unpin':
      // المدير والمحرر فقط يمكنهما إلغاء تثبيت المقالات
      await requirePermission(request, Permission.UPDATE_POST)
      
      result = await prisma.post.update({
        where: { id: postId },
        data: { isPinned: false },
      })
      
      await logApiAction(
        request,
        'POST_UNPIN',
        'POST',
        postId,
        { title: post.title }
      )
      
      break
      
    case 'like':
      // إضافة إعجاب (للمستخدمين المسجلين فقط)
      const existingLike = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: user.id,
          },
        },
      })
      
      if (existingLike) {
        throw new Error('لقد أعجبت بهذا المقال بالفعل')
      }
      
      await prisma.postLike.create({
        data: {
          postId,
          userId: user.id,
        },
      })
      
      // تحديث عداد الإعجابات
      result = await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      })
      
      break
      
    case 'unlike':
      // إزالة إعجاب
      const likeToRemove = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: user.id,
          },
        },
      })
      
      if (!likeToRemove) {
        throw new Error('لم تعجب بهذا المقال')
      }
      
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: user.id,
          },
        },
      })
      
      // تحديث عداد الإعجابات
      result = await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      })
      
      break
      
    case 'share':
      // تسجيل مشاركة
      result = await prisma.post.update({
        where: { id: postId },
        data: { shares: { increment: 1 } },
      })
      
      await logApiAction(
        request,
        'POST_SHARE',
        'POST',
        postId,
        { title: post.title, platform: data?.platform }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, 'تم تنفيذ العملية بنجاح')
})

