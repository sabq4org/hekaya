import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requirePermission,
  validateRequired,
  createSlug,
  logApiAction,
  ApiErrors,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'

// GET /api/tags/[id] - الحصول على وسم واحد
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const tagId = params.id
  const url = new URL(request.url)
  const includeStats = url.searchParams.get('includeStats') === 'true'
  const includePosts = url.searchParams.get('includePosts') === 'true'
  const postsLimit = parseInt(url.searchParams.get('postsLimit') || '10')
  
  // البحث بالـ ID أو الـ slug
  const tag = await prisma.tag.findFirst({
    where: {
      OR: [
        { id: tagId },
        { slug: tagId },
      ],
    },
    include: {
      ...(includeStats && {
        _count: {
          select: {
            posts: { where: { post: { status: 'PUBLISHED' } } },
          },
        },
      }),
      ...(includePosts && {
        posts: {
          where: { post: { status: 'PUBLISHED' } },
          include: {
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
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
                _count: {
                  select: {
                    comments: { where: { status: 'APPROVED' } },
                  },
                },
              },
            },
          },
          orderBy: { post: { publishedAt: 'desc' } },
          take: postsLimit,
        },
      }),
    },
  })
  
  if (!tag) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // تنسيق البيانات إذا كانت المقالات مضمنة
  let formattedTag = tag
  if (includePosts && tag.posts) {
    formattedTag = {
      ...tag,
      posts: tag.posts.map(pt => ({
        ...pt.post,
        commentsCount: pt.post._count.comments,
        _count: undefined,
      })),
    }
  }
  
  return successResponse(formattedTag)
})

// PUT /api/tags/[id] - تحديث وسم
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.UPDATE_TAG)
  const data = await request.json()
  const tagId = params.id
  
  // البحث عن الوسم
  const existingTag = await prisma.tag.findUnique({
    where: { id: tagId },
  })
  
  if (!existingTag) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // إعداد البيانات للتحديث
  const updateData: any = {}
  
  if (data.name) {
    // التأكد من عدم تكرار الاسم
    const nameExists = await prisma.tag.findFirst({
      where: {
        name: data.name,
        id: { not: tagId },
      },
    })
    
    if (nameExists) {
      throw new Error('اسم الوسم موجود بالفعل')
    }
    
    updateData.name = data.name
  }
  
  if (data.description !== undefined) updateData.description = data.description
  if (data.color) updateData.color = data.color
  
  // تحديث الـ slug إذا تغير الاسم
  if (data.name && data.name !== existingTag.name) {
    const newSlug = data.slug || createSlug(data.name)
    
    // التأكد من أن الـ slug فريد
    const slugExists = await prisma.tag.findFirst({
      where: {
        slug: newSlug,
        id: { not: tagId },
      },
    })
    
    if (slugExists) {
      updateData.slug = `${newSlug}-${Date.now()}`
    } else {
      updateData.slug = newSlug
    }
  }
  
  // تحديث الوسم
  const updatedTag = await prisma.tag.update({
    where: { id: tagId },
    data: updateData,
    include: {
      _count: {
        select: {
          posts: { where: { post: { status: 'PUBLISHED' } } },
        },
      },
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'TAG_UPDATE',
    'TAG',
    updatedTag.id,
    { 
      name: updatedTag.name, 
      changes: Object.keys(updateData),
      oldName: existingTag.name,
    }
  )
  
  return successResponse(updatedTag, 'تم تحديث الوسم بنجاح')
})

// DELETE /api/tags/[id] - حذف وسم
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.DELETE_TAG)
  const tagId = params.id
  const url = new URL(request.url)
  const force = url.searchParams.get('force') === 'true'
  
  // البحث عن الوسم
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })
  
  if (!tag) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الاستخدام إذا لم يكن الحذف قسري
  if (!force && tag.usageCount > 0) {
    throw new Error(`لا يمكن حذف الوسم لأنه مستخدم في ${tag.usageCount} مقال. استخدم force=true للحذف القسري`)
  }
  
  // حذف الوسم (سيحذف الروابط مع المقالات تلقائياً)
  await prisma.tag.delete({
    where: { id: tagId },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'TAG_DELETE',
    'TAG',
    tagId,
    { name: tag.name, usageCount: tag.usageCount, force }
  )
  
  return successResponse(null, 'تم حذف الوسم بنجاح')
})

// PATCH /api/tags/[id] - عمليات خاصة على الوسم
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.UPDATE_TAG)
  const { action, data } = await request.json()
  const tagId = params.id
  
  validateRequired({ action }, ['action'])
  
  // البحث عن الوسم
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  })
  
  if (!tag) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  let result
  
  switch (action) {
    case 'refreshUsageCount':
      // إعادة حساب عداد الاستخدام
      const actualUsageCount = await prisma.postTag.count({
        where: { 
          tagId,
          post: { status: 'PUBLISHED' },
        },
      })
      
      result = await prisma.tag.update({
        where: { id: tagId },
        data: { usageCount: actualUsageCount },
      })
      
      await logApiAction(
        request,
        'TAG_REFRESH_USAGE_COUNT',
        'TAG',
        tagId,
        { 
          name: tag.name, 
          oldCount: tag.usageCount,
          newCount: actualUsageCount,
        }
      )
      
      break
      
    case 'removeFromPosts':
      validateRequired(data, ['postIds'])
      
      if (!Array.isArray(data.postIds)) {
        throw new Error('postIds يجب أن يكون مصفوفة')
      }
      
      // إزالة الوسم من المقالات المحددة
      const removeResult = await prisma.postTag.deleteMany({
        where: {
          tagId,
          postId: { in: data.postIds },
        },
      })
      
      // تحديث عداد الاستخدام
      await prisma.tag.update({
        where: { id: tagId },
        data: { usageCount: { decrement: removeResult.count } },
      })
      
      result = { removedFromPosts: removeResult.count }
      
      await logApiAction(
        request,
        'TAG_REMOVE_FROM_POSTS',
        'TAG',
        tagId,
        { 
          name: tag.name, 
          postIds: data.postIds,
          removedCount: removeResult.count,
        }
      )
      
      break
      
    case 'addToPosts':
      validateRequired(data, ['postIds'])
      
      if (!Array.isArray(data.postIds)) {
        throw new Error('postIds يجب أن يكون مصفوفة')
      }
      
      // التحقق من وجود المقالات
      const existingPosts = await prisma.post.findMany({
        where: { id: { in: data.postIds } },
        select: { id: true },
      })
      
      if (existingPosts.length !== data.postIds.length) {
        throw new Error('بعض المقالات غير موجودة')
      }
      
      // إضافة الوسم للمقالات
      const addData = data.postIds.map((postId: string) => ({
        tagId,
        postId,
      }))
      
      await prisma.postTag.createMany({
        data: addData,
        skipDuplicates: true,
      })
      
      // إعادة حساب عداد الاستخدام
      const newUsageCount = await prisma.postTag.count({
        where: { tagId },
      })
      
      await prisma.tag.update({
        where: { id: tagId },
        data: { usageCount: newUsageCount },
      })
      
      result = { 
        addedToPosts: data.postIds.length,
        newUsageCount,
      }
      
      await logApiAction(
        request,
        'TAG_ADD_TO_POSTS',
        'TAG',
        tagId,
        { 
          name: tag.name, 
          postIds: data.postIds,
          addedCount: data.postIds.length,
          newUsageCount,
        }
      )
      
      break
      
    case 'duplicate':
      // إنشاء نسخة من الوسم
      const duplicateSlug = `${tag.slug}-copy-${Date.now()}`
      
      result = await prisma.tag.create({
        data: {
          name: `${tag.name} - نسخة`,
          slug: duplicateSlug,
          description: tag.description,
          color: tag.color,
          usageCount: 0, // النسخة تبدأ بدون استخدامات
        },
      })
      
      await logApiAction(
        request,
        'TAG_DUPLICATE',
        'TAG',
        result.id,
        { originalName: tag.name, newName: result.name }
      )
      
      break
      
    case 'generateSimilar':
      // اقتراح وسوم مشابهة بناءً على الاسم
      const similarTags = await prisma.tag.findMany({
        where: {
          OR: [
            { name: { contains: tag.name.split(' ')[0], mode: 'insensitive' } },
            { description: { contains: tag.name, mode: 'insensitive' } },
          ],
          id: { not: tagId },
        },
        take: 10,
        orderBy: { usageCount: 'desc' },
      })
      
      result = { similarTags }
      
      break
      
    case 'getRelatedTags':
      // البحث عن الوسوم المرتبطة (المستخدمة مع نفس المقالات)
      const relatedTags = await prisma.tag.findMany({
        where: {
          posts: {
            some: {
              post: {
                tags: {
                  some: { tagId },
                },
              },
            },
          },
          id: { not: tagId },
        },
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  post: {
                    tags: {
                      some: { tagId },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          usageCount: 'desc',
        },
        take: 20,
      })
      
      result = { 
        relatedTags: relatedTags.map(rt => ({
          ...rt,
          sharedPostsCount: rt._count.posts,
          _count: undefined,
        })),
      }
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, 'تم تنفيذ العملية بنجاح')
})

