import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requirePermission,
  parsePagination,
  parseFilters,
  validateRequired,
  createSlug,
  logApiAction,
  ApiErrors,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'

// GET /api/tags - الحصول على قائمة الوسوم
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const includeStats = url.searchParams.get('includeStats') === 'true'
  const minUsage = parseInt(url.searchParams.get('minUsage') || '0')
  const maxUsage = parseInt(url.searchParams.get('maxUsage') || '999999')
  const popular = url.searchParams.get('popular') === 'true'
  
  // بناء شروط البحث
  const where: any = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بعدد الاستخدامات
  if (minUsage > 0 || maxUsage < 999999) {
    where.usageCount = {
      gte: minUsage,
      lte: maxUsage,
    }
  }
  
  // ترتيب خاص للوسوم الشائعة
  let orderBy: any = { [filters.sortBy]: filters.sortOrder }
  if (popular) {
    orderBy = { usageCount: 'desc' }
  }
  
  const includeOptions: any = {}
  
  // إضافة الإحصائيات إذا طُلبت
  if (includeStats) {
    includeOptions._count = {
      select: {
        posts: { where: { post: { status: 'PUBLISHED' } } },
      },
    }
  }
  
  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: includeOptions,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.tag.count({ where }),
  ])
  
  return successResponse(tags, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/tags - إنشاء وسم جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.CREATE_TAG)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['name'])
  
  // إنشاء slug تلقائياً إذا لم يكن موجوداً
  if (!data.slug) {
    data.slug = createSlug(data.name)
  }
  
  // التأكد من أن الـ slug فريد
  const existingTag = await prisma.tag.findUnique({
    where: { slug: data.slug },
  })
  
  if (existingTag) {
    data.slug = `${data.slug}-${Date.now()}`
  }
  
  // التأكد من أن الاسم فريد
  const existingName = await prisma.tag.findUnique({
    where: { name: data.name },
  })
  
  if (existingName) {
    throw new Error('اسم الوسم موجود بالفعل')
  }
  
  // إنشاء الوسم
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color || '#6B7280',
      usageCount: 0,
    },
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
    'TAG_CREATE',
    'TAG',
    tag.id,
    { name: tag.name }
  )
  
  return successResponse(tag, 'تم إنشاء الوسم بنجاح')
})

// PUT /api/tags/merge - دمج وسوم
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.MERGE_TAG)
  const { sourceTagIds, targetTagId } = await request.json()
  
  validateRequired({ sourceTagIds, targetTagId }, ['sourceTagIds', 'targetTagId'])
  
  if (!Array.isArray(sourceTagIds) || sourceTagIds.length === 0) {
    throw new Error('يجب تحديد وسوم للدمج')
  }
  
  if (sourceTagIds.includes(targetTagId)) {
    throw new Error('لا يمكن دمج الوسم مع نفسه')
  }
  
  // التحقق من وجود الوسم المستهدف
  const targetTag = await prisma.tag.findUnique({
    where: { id: targetTagId },
  })
  
  if (!targetTag) {
    throw new Error('الوسم المستهدف غير موجود')
  }
  
  // التحقق من وجود الوسوم المصدر
  const sourceTags = await prisma.tag.findMany({
    where: { id: { in: sourceTagIds } },
  })
  
  if (sourceTags.length !== sourceTagIds.length) {
    throw new Error('بعض الوسوم المصدر غير موجودة')
  }
  
  // نقل جميع المقالات للوسم المستهدف
  await prisma.postTag.updateMany({
    where: { tagId: { in: sourceTagIds } },
    data: { tagId: targetTagId },
  })
  
  // حذف الروابط المكررة
  await prisma.$executeRaw`
    DELETE FROM "PostTag" pt1
    WHERE EXISTS (
      SELECT 1 FROM "PostTag" pt2
      WHERE pt2."postId" = pt1."postId"
      AND pt2."tagId" = pt1."tagId"
      AND pt2."id" > pt1."id"
    )
  `
  
  // حساب عدد الاستخدامات الجديد
  const newUsageCount = await prisma.postTag.count({
    where: { tagId: targetTagId },
  })
  
  // تحديث عداد الاستخدام للوسم المستهدف
  await prisma.tag.update({
    where: { id: targetTagId },
    data: { usageCount: newUsageCount },
  })
  
  // حذف الوسوم المصدر
  await prisma.tag.deleteMany({
    where: { id: { in: sourceTagIds } },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'TAGS_MERGE',
    'TAG',
    targetTagId,
    { 
      targetName: targetTag.name,
      sourceNames: sourceTags.map(t => t.name),
      sourceTagIds,
      newUsageCount,
    }
  )
  
  return successResponse(
    { targetTag, mergedCount: sourceTags.length, newUsageCount },
    `تم دمج ${sourceTags.length} وسم في "${targetTag.name}"`
  )
})

// PATCH /api/tags/bulk - عمليات جماعية على الوسوم
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.UPDATE_TAG)
  const { action, tagIds, data } = await request.json()
  
  validateRequired({ action, tagIds }, ['action', 'tagIds'])
  
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    throw new Error('يجب تحديد وسوم للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'updateColor':
      validateRequired(data, ['color'])
      
      result = await prisma.tag.updateMany({
        where: { id: { in: tagIds } },
        data: { color: data.color },
      })
      
      await logApiAction(
        request,
        'TAGS_BULK_UPDATE_COLOR',
        'TAG',
        undefined,
        { tagIds, color: data.color, count: result.count }
      )
      
      break
      
    case 'updateDescription':
      validateRequired(data, ['description'])
      
      result = await prisma.tag.updateMany({
        where: { id: { in: tagIds } },
        data: { description: data.description },
      })
      
      await logApiAction(
        request,
        'TAGS_BULK_UPDATE_DESCRIPTION',
        'TAG',
        undefined,
        { tagIds, description: data.description, count: result.count }
      )
      
      break
      
    case 'resetUsageCount':
      // إعادة حساب عداد الاستخدام لكل وسم
      const updatePromises = tagIds.map(async (tagId: string) => {
        const usageCount = await prisma.postTag.count({
          where: { 
            tagId,
            post: { status: 'PUBLISHED' },
          },
        })
        
        return prisma.tag.update({
          where: { id: tagId },
          data: { usageCount },
        })
      })
      
      await Promise.all(updatePromises)
      
      result = { count: tagIds.length }
      
      await logApiAction(
        request,
        'TAGS_BULK_RESET_USAGE',
        'TAG',
        undefined,
        { tagIds, count: tagIds.length }
      )
      
      break
      
    case 'delete':
      // التحقق من صلاحية الحذف
      await requirePermission(request, Permission.DELETE_TAG)
      
      // التحقق من عدم استخدام الوسوم
      const usedTags = await prisma.tag.findMany({
        where: { 
          id: { in: tagIds },
          usageCount: { gt: 0 },
        },
        select: { id: true, name: true, usageCount: true },
      })
      
      if (usedTags.length > 0) {
        const usedTagNames = usedTags.map(t => `${t.name} (${t.usageCount})`).join(', ')
        throw new Error(`لا يمكن حذف الوسوم المستخدمة: ${usedTagNames}`)
      }
      
      result = await prisma.tag.deleteMany({
        where: { id: { in: tagIds } },
      })
      
      await logApiAction(
        request,
        'TAGS_BULK_DELETE',
        'TAG',
        undefined,
        { tagIds, count: result.count }
      )
      
      break
      
    case 'cleanUnused':
      // حذف الوسوم غير المستخدمة
      result = await prisma.tag.deleteMany({
        where: { 
          id: { in: tagIds },
          usageCount: 0,
        },
      })
      
      await logApiAction(
        request,
        'TAGS_BULK_CLEAN_UNUSED',
        'TAG',
        undefined,
        { tagIds, deletedCount: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} وسم`)
})

// DELETE /api/tags/unused - حذف جميع الوسوم غير المستخدمة
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.DELETE_TAG)
  
  // حذف الوسوم غير المستخدمة
  const result = await prisma.tag.deleteMany({
    where: { usageCount: 0 },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'TAGS_DELETE_ALL_UNUSED',
    'TAG',
    undefined,
    { deletedCount: result.count }
  )
  
  return successResponse(result, `تم حذف ${result.count} وسم غير مستخدم`)
})

