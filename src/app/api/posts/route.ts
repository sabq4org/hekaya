import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  createSlug,
  logApiAction,
  requireAuth,
  requirePermission,
  validateRequired,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'
import { Role, PostStatus } from '@prisma/client'

// GET /api/posts - الحصول على قائمة المقالات
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const featured = url.searchParams.get('featured')
  const published = url.searchParams.get('published')
  const authorId = url.searchParams.get('authorId')
  const sectionId = url.searchParams.get('sectionId')
  const tagId = url.searchParams.get('tagId')
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { summary: { contains: filters.search, mode: 'insensitive' } },
      { contentText: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالحالة
  if (filters.status) {
    where.status = filters.status
  }
  
  // فلترة بالكاتب
  if (filters.author || authorId) {
    where.authorId = filters.author || authorId
  }
  
  // فلترة بالقسم
  if (filters.section || sectionId) {
    where.sectionId = filters.section || sectionId
  }
  
  // فلترة بالوسم
  if (filters.tag || tagId) {
    where.tags = {
      some: {
        tagId: filters.tag || tagId
      }
    }
  }
  
  // فلترة المقالات المميزة
  if (featured === 'true') {
    where.isFeatured = true
  }
  
  // فلترة المقالات المنشورة فقط
  if (published === 'true') {
    where.status = PostStatus.PUBLISHED
    where.publishedAt = { lte: new Date() }
  }
  
  // التحقق من الصلاحيات
  try {
    const user = await requireAuth(request)
    
    // إذا لم يكن مدير أو محرر، يرى مقالاته فقط
    if (user.role === Role.AUTHOR) {
      where.authorId = user.id
    }
  } catch {
    // للزوار غير المسجلين، المقالات المنشورة فقط
    where.status = PostStatus.PUBLISHED
    where.publishedAt = { lte: new Date() }
  }
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
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
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: { status: 'APPROVED' }
            },
          },
        },
      },
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ])
  
  // تنسيق البيانات
  const formattedPosts = posts.map(post => ({
    ...post,
    tags: post.tags.map(pt => pt.tag),
    commentsCount: post._count.comments,
    _count: undefined,
  }))
  
  return successResponse(formattedPosts, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/posts - إنشاء مقال جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.CREATE_POST)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['title', 'content'])
  
  // إنشاء slug تلقائياً إذا لم يكن موجوداً
  if (!data.slug) {
    data.slug = createSlug(data.title)
  }
  
  // التأكد من أن الـ slug فريد
  const existingPost = await prisma.post.findUnique({
    where: { slug: data.slug },
  })
  
  if (existingPost) {
    data.slug = `${data.slug}-${Date.now()}`
  }
  
  // حساب وقت القراءة التقريبي
  if (data.contentText) {
    const wordsPerMinute = 200
    const wordCount = data.contentText.split(/\s+/).length
    data.readingTime = Math.ceil(wordCount / wordsPerMinute)
  }
  
  // تحديد الكاتب الفعلي في قاعدة البيانات لتفادي كسر FK
  if (!user.email) {
    throw new Error('لا يمكن تحديد هوية المستخدم (البريد الإلكتروني مفقود)')
  }
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name ?? undefined },
    create: {
      email: user.email,
      name: user.name ?? 'مستخدم',
      // الأدوار الافتراضية حسب المخطط
      role: Role.AUTHOR,
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })

  // السماح بتمرير authorId فقط للمدير/المحرر
  const resolvedAuthorId = (data.authorId && (user.role === Role.ADMIN || user.role === Role.EDITOR))
    ? data.authorId
    : dbUser.id

  // التحقق من وجود القسم أو إنشاء قسم افتراضي
  let resolvedSectionId = data.sectionId
  if (resolvedSectionId) {
    const sectionExists = await prisma.section.findUnique({
      where: { id: resolvedSectionId }
    })
    if (!sectionExists) {
      console.warn(`القسم ${resolvedSectionId} غير موجود، سيتم استخدام القسم الافتراضي`)
      resolvedSectionId = null
    }
  }
  
  // إذا لم يكن هناك قسم صالح، استخدم أو أنشئ قسم افتراضي
  if (!resolvedSectionId) {
    const defaultSection = await prisma.section.upsert({
      where: { slug: 'general' },
      update: {},
      create: {
        name: 'عام',
        slug: 'general',
        description: 'مقالات عامة',
        color: '#6B7280'
      }
    })
    resolvedSectionId = defaultSection.id
  }

  // إعداد البيانات للإنشاء
  const postData: Record<string, unknown> = {
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content,
    contentText: data.contentText,
    status: data.status || PostStatus.DRAFT,
    coverImage: data.coverImage,
    coverAlt: data.coverAlt,
    readingTime: data.readingTime || 0,
    authorId: resolvedAuthorId,
    sectionId: resolvedSectionId,
    scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    ogImage: data.ogImage,
    isFeatured: data.isFeatured || false,
    isPinned: data.isPinned || false,
    allowComments: data.allowComments !== false,
  }
  
  // إذا كان المقال منشوراً، تعيين تاريخ النشر
  if (postData.status === PostStatus.PUBLISHED) {
    postData.publishedAt = new Date()
  }
  
  // إنشاء المقال
  const post = await prisma.post.create({
    data: postData,
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
  
  // ربط الوسوم إذا كانت موجودة
  if (data.tagIds && Array.isArray(data.tagIds) && data.tagIds.length > 0) {
    // التحقق من وجود الوسوم المرسلة
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
      select: { id: true }
    })
    
    const validTagIds = existingTags.map(tag => tag.id)
    
    if (validTagIds.length > 0) {
      await prisma.postTag.createMany({
        data: validTagIds.map((tagId: string) => ({
          postId: post.id,
          tagId,
        })),
        skipDuplicates: true,
      })
      
      // تحديث عداد استخدام الوسوم
      await prisma.tag.updateMany({
        where: { id: { in: validTagIds } },
        data: { usageCount: { increment: 1 } },
      })
    } else {
      console.warn('لم يتم العثور على أي وسوم صالحة من المعرفات المرسلة:', data.tagIds)
    }
  }
  
  // تسجيل العملية
  await logApiAction(
    request,
    'POST_CREATE',
    'POST',
    post.id,
    { title: post.title, status: post.status }
  )
  
  return successResponse(post, 'تم إنشاء المقال بنجاح')
})

// PUT /api/posts/bulk - عمليات جماعية
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.UPDATE_POST)
  const { action, postIds, data } = await request.json()
  
  validateRequired({ action, postIds }, ['action', 'postIds'])
  
  if (!Array.isArray(postIds) || postIds.length === 0) {
    throw new Error('يجب تحديد مقالات للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'updateStatus': {
      validateRequired(data, ['status'])
      
      const updateData: Record<string, unknown> = { status: data.status }
      
      // إذا كان النشر، تعيين تاريخ النشر
      if (data.status === PostStatus.PUBLISHED) {
        updateData.publishedAt = new Date()
      }
      
      result = await prisma.post.updateMany({
        where: { 
          id: { in: postIds },
          ...(user.role === Role.AUTHOR ? { authorId: user.id } : {}),
        },
        data: updateData,
      })
      
      await logApiAction(
        request,
        'POST_BULK_UPDATE_STATUS',
        'POST',
        undefined,
        { postIds, status: data.status, count: result.count }
      )
      break
    }
    
    case 'updateSection': {
      validateRequired(data, ['sectionId'])
      
      result = await prisma.post.updateMany({
        where: { 
          id: { in: postIds },
          ...(user.role === Role.AUTHOR ? { authorId: user.id } : {}),
        },
        data: { sectionId: data.sectionId },
      })
      
      await logApiAction(
        request,
        'POST_BULK_UPDATE_SECTION',
        'POST',
        undefined,
        { postIds, sectionId: data.sectionId, count: result.count }
      )
      break
    }
    
    case 'addTags': {
      validateRequired(data, ['tagIds'])
      
      const tagAssignments = postIds.flatMap((postId: string) =>
        data.tagIds.map((tagId: string) => ({ postId, tagId }))
      )
      
      await prisma.postTag.createMany({
        data: tagAssignments,
        skipDuplicates: true,
      })
      
      await prisma.tag.updateMany({
        where: { id: { in: data.tagIds } },
        data: { usageCount: { increment: postIds.length } },
      })
      
      result = { count: postIds.length }
      
      await logApiAction(
        request,
        'POST_BULK_ADD_TAGS',
        'POST',
        undefined,
        { postIds, tagIds: data.tagIds, count: postIds.length }
      )
      break
    }
    
    case 'removeTags': {
      validateRequired(data, ['tagIds'])
      
      await prisma.postTag.deleteMany({
        where: {
          postId: { in: postIds },
          tagId: { in: data.tagIds },
        },
      })
      
      await prisma.tag.updateMany({
        where: { id: { in: data.tagIds } },
        data: { usageCount: { decrement: 1 } },
      })
      
      result = { count: postIds.length }
      
      await logApiAction(
        request,
        'POST_BULK_REMOVE_TAGS',
        'POST',
        undefined,
        { postIds, tagIds: data.tagIds, count: postIds.length }
      )
      break
    }
    
    case 'archive': {
      result = await prisma.post.updateMany({
        where: { 
          id: { in: postIds },
          ...(user.role === Role.AUTHOR ? { authorId: user.id } : {}),
        },
        data: { 
          status: PostStatus.ARCHIVED,
          archivedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'POST_BULK_ARCHIVE',
        'POST',
        undefined,
        { postIds, count: result.count }
      )
      break
    }
    
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} مقال`)
})

