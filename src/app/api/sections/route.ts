import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  createSlug,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/sections - الحصول على قائمة الأقسام
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const includeStats = url.searchParams.get('includeStats') === 'true'
  const parentId = url.searchParams.get('parentId')
  const hierarchical = url.searchParams.get('hierarchical') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالقسم الأب
  if (parentId) {
    where.parentId = parentId === 'null' ? null : parentId
  }
  
  // إذا كان العرض هرمي، جلب الأقسام الرئيسية فقط
  if (hierarchical) {
    where.parentId = null
  }
  
  const includeOptions: Record<string, unknown> = {
    parent: {
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
      },
    },
  }
  
  // إضافة الأقسام الفرعية في العرض الهرمي
  if (hierarchical) {
    includeOptions.children = {
      include: {
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
            children: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    }
  }
  
  // إضافة الإحصائيات إذا طُلبت
  if (includeStats) {
    includeOptions._count = {
      select: {
        posts: { where: { status: 'PUBLISHED' } },
        children: true,
      },
    }
  }
  
  const [sections, total] = await Promise.all([
    prisma.section.findMany({
      where,
      include: includeOptions,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      skip: hierarchical ? undefined : skip,
      take: hierarchical ? undefined : limit,
    }),
    hierarchical ? Promise.resolve(0) : prisma.section.count({ where }),
  ])
  
  return successResponse(sections, undefined, hierarchical ? undefined : {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/sections - إنشاء قسم جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.CREATE_SECTION)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['name'])
  
  // إنشاء slug تلقائياً إذا لم يكن موجوداً
  if (!data.slug) {
    data.slug = createSlug(data.name)
  }
  
  // التأكد من أن الـ slug فريد
  const existingSection = await prisma.section.findUnique({
    where: { slug: data.slug },
  })
  
  if (existingSection) {
    data.slug = `${data.slug}-${Date.now()}`
  }
  
  // التحقق من القسم الأب إذا كان موجوداً
  if (data.parentId) {
    const parentSection = await prisma.section.findUnique({
      where: { id: data.parentId },
    })
    
    if (!parentSection) {
      throw new Error('القسم الأب غير موجود')
    }
  }
  
  // تحديد الترتيب التلقائي
  if (!data.order) {
    const lastSection = await prisma.section.findFirst({
      where: { parentId: data.parentId || null },
      orderBy: { order: 'desc' },
    })
    
    data.order = (lastSection?.order || 0) + 1
  }
  
  // إنشاء القسم
  const section = await prisma.section.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color || '#3B82F6',
      parentId: data.parentId || null,
      order: data.order,
      isVisible: data.isVisible !== false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
      _count: {
        select: {
          posts: { where: { status: 'PUBLISHED' } },
          children: true,
        },
      },
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SECTION_CREATE',
    'SECTION',
    section.id,
    { name: section.name, parentId: section.parentId }
  )
  
  return successResponse(section, 'تم إنشاء القسم بنجاح')
})

// PUT /api/sections/reorder - إعادة ترتيب الأقسام
export const PUT = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.UPDATE_SECTION)
  const { sections } = await request.json()
  
  validateRequired({ sections }, ['sections'])
  
  if (!Array.isArray(sections)) {
    throw new Error('يجب أن تكون الأقسام مصفوفة')
  }
  
  // تحديث ترتيب الأقسام
  const updatePromises = sections.map((section: Record<string, unknown>, index: number) =>
    prisma.section.update({
      where: { id: section.id },
      data: { 
        order: index + 1,
        parentId: section.parentId || null,
      },
    })
  )
  
  await Promise.all(updatePromises)
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SECTIONS_REORDER',
    'SECTION',
    undefined,
    { sectionIds: sections.map((s: Record<string, unknown>) => s.id), count: sections.length }
  )
  
  return successResponse(null, 'تم إعادة ترتيب الأقسام بنجاح')
})

// PATCH /api/sections/bulk - عمليات جماعية على الأقسام
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.UPDATE_SECTION)
  const { action, sectionIds, data } = await request.json()
  
  validateRequired({ action, sectionIds }, ['action', 'sectionIds'])
  
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    throw new Error('يجب تحديد أقسام للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'updateVisibility':
      validateRequired(data, ['isVisible'])
      
      result = await prisma.section.updateMany({
        where: { id: { in: sectionIds } },
        data: { isVisible: data.isVisible },
      })
      
      await logApiAction(
        request,
        'SECTIONS_BULK_UPDATE_VISIBILITY',
        'SECTION',
        undefined,
        { sectionIds, isVisible: data.isVisible, count: result.count }
      )
      
      break
      
    case 'updateParent':
      validateRequired(data, ['parentId'])
      
      // التحقق من عدم وجود دورة في الهرمية
      if (data.parentId) {
        const parentSection = await prisma.section.findUnique({
          where: { id: data.parentId },
          include: { parent: true },
        })
        
        if (!parentSection) {
          throw new Error('القسم الأب غير موجود')
        }
        
        // التحقق من عدم جعل القسم أباً لنفسه أو لأحد أجداده
        if (sectionIds.includes(data.parentId)) {
          throw new Error('لا يمكن جعل القسم أباً لنفسه')
        }
      }
      
      result = await prisma.section.updateMany({
        where: { id: { in: sectionIds } },
        data: { parentId: data.parentId || null },
      })
      
      await logApiAction(
        request,
        'SECTIONS_BULK_UPDATE_PARENT',
        'SECTION',
        undefined,
        { sectionIds, parentId: data.parentId, count: result.count }
      )
      
      break
      
    case 'updateColor':
      validateRequired(data, ['color'])
      
      result = await prisma.section.updateMany({
        where: { id: { in: sectionIds } },
        data: { color: data.color },
      })
      
      await logApiAction(
        request,
        'SECTIONS_BULK_UPDATE_COLOR',
        'SECTION',
        undefined,
        { sectionIds, color: data.color, count: result.count }
      )
      
      break
      
    case 'delete':
      // التحقق من صلاحية الحذف
      await requirePermission(request, Permission.DELETE_SECTION)
      
      // التحقق من عدم وجود مقالات في الأقسام
      const postsCount = await prisma.post.count({
        where: { sectionId: { in: sectionIds } },
      })
      
      if (postsCount > 0) {
        throw new Error(`لا يمكن حذف الأقسام لأنها تحتوي على ${postsCount} مقال`)
      }
      
      // التحقق من عدم وجود أقسام فرعية
      const childrenCount = await prisma.section.count({
        where: { parentId: { in: sectionIds } },
      })
      
      if (childrenCount > 0) {
        throw new Error(`لا يمكن حذف الأقسام لأنها تحتوي على ${childrenCount} قسم فرعي`)
      }
      
      result = await prisma.section.deleteMany({
        where: { id: { in: sectionIds } },
      })
      
      await logApiAction(
        request,
        'SECTIONS_BULK_DELETE',
        'SECTION',
        undefined,
        { sectionIds, count: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} قسم`)
})

