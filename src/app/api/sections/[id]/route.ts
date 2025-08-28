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

// GET /api/sections/[id] - الحصول على قسم واحد
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const sectionId = params.id
  const url = new URL(request.url)
  const includeStats = url.searchParams.get('includeStats') === 'true'
  const includePosts = url.searchParams.get('includePosts') === 'true'
  
  // البحث بالـ ID أو الـ slug
  const section = await prisma.section.findFirst({
    where: {
      OR: [
        { id: sectionId },
        { slug: sectionId },
      ],
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
      children: {
        include: {
          _count: {
            select: {
              posts: { where: { status: 'PUBLISHED' } },
              children: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      ...(includeStats && {
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
            children: true,
          },
        },
      }),
      ...(includePosts && {
        posts: {
          where: { status: 'PUBLISHED' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                comments: { where: { status: 'APPROVED' } },
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
      }),
    },
  })
  
  if (!section) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // زيادة عداد المشاهدات
  await prisma.section.update({
    where: { id: section.id },
    data: { views: { increment: 1 } },
  })
  
  return successResponse(section)
})

// PUT /api/sections/[id] - تحديث قسم
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.UPDATE_SECTION)
  const data = await request.json()
  const sectionId = params.id
  
  // البحث عن القسم
  const existingSection = await prisma.section.findUnique({
    where: { id: sectionId },
  })
  
  if (!existingSection) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // إعداد البيانات للتحديث
  const updateData: any = {}
  
  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.color) updateData.color = data.color
  if (data.isVisible !== undefined) updateData.isVisible = data.isVisible
  if (data.order !== undefined) updateData.order = data.order
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription
  
  // تحديث الـ slug إذا تغير الاسم
  if (data.name && data.name !== existingSection.name) {
    const newSlug = data.slug || createSlug(data.name)
    
    // التأكد من أن الـ slug فريد
    const slugExists = await prisma.section.findFirst({
      where: {
        slug: newSlug,
        id: { not: sectionId },
      },
    })
    
    if (slugExists) {
      updateData.slug = `${newSlug}-${Date.now()}`
    } else {
      updateData.slug = newSlug
    }
  }
  
  // تحديث القسم الأب
  if (data.parentId !== undefined) {
    // التحقق من عدم جعل القسم أباً لنفسه
    if (data.parentId === sectionId) {
      throw new Error('لا يمكن جعل القسم أباً لنفسه')
    }
    
    // التحقق من وجود القسم الأب
    if (data.parentId) {
      const parentSection = await prisma.section.findUnique({
        where: { id: data.parentId },
      })
      
      if (!parentSection) {
        throw new Error('القسم الأب غير موجود')
      }
      
      // التحقق من عدم إنشاء دورة في الهرمية
      const checkCycle = async (parentId: string, targetId: string): Promise<boolean> => {
        if (parentId === targetId) return true
        
        const parent = await prisma.section.findUnique({
          where: { id: parentId },
          select: { parentId: true },
        })
        
        if (parent?.parentId) {
          return await checkCycle(parent.parentId, targetId)
        }
        
        return false
      }
      
      const hasCycle = await checkCycle(data.parentId, sectionId)
      if (hasCycle) {
        throw new Error('لا يمكن إنشاء دورة في هرمية الأقسام')
      }
    }
    
    updateData.parentId = data.parentId || null
  }
  
  // تحديث القسم
  const updatedSection = await prisma.section.update({
    where: { id: sectionId },
    data: updateData,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
      children: {
        include: {
          _count: {
            select: {
              posts: { where: { status: 'PUBLISHED' } },
              children: true,
            },
          },
        },
        orderBy: { order: 'asc' },
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
    'SECTION_UPDATE',
    'SECTION',
    updatedSection.id,
    { 
      name: updatedSection.name, 
      changes: Object.keys(updateData),
      oldParentId: existingSection.parentId,
      newParentId: updatedSection.parentId,
    }
  )
  
  return successResponse(updatedSection, 'تم تحديث القسم بنجاح')
})

// DELETE /api/sections/[id] - حذف قسم
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.DELETE_SECTION)
  const sectionId = params.id
  
  // البحث عن القسم
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      _count: {
        select: {
          posts: true,
          children: true,
        },
      },
    },
  })
  
  if (!section) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من عدم وجود مقالات
  if (section._count.posts > 0) {
    throw new Error(`لا يمكن حذف القسم لأنه يحتوي على ${section._count.posts} مقال`)
  }
  
  // التحقق من عدم وجود أقسام فرعية
  if (section._count.children > 0) {
    throw new Error(`لا يمكن حذف القسم لأنه يحتوي على ${section._count.children} قسم فرعي`)
  }
  
  // حذف القسم
  await prisma.section.delete({
    where: { id: sectionId },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SECTION_DELETE',
    'SECTION',
    sectionId,
    { name: section.name, parentId: section.parentId }
  )
  
  return successResponse(null, 'تم حذف القسم بنجاح')
})

// PATCH /api/sections/[id] - عمليات خاصة على القسم
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requirePermission(request, Permission.UPDATE_SECTION)
  const { action, data } = await request.json()
  const sectionId = params.id
  
  validateRequired({ action }, ['action'])
  
  // البحث عن القسم
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
  })
  
  if (!section) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  let result
  
  switch (action) {
    case 'toggleVisibility':
      result = await prisma.section.update({
        where: { id: sectionId },
        data: { isVisible: !section.isVisible },
      })
      
      await logApiAction(
        request,
        'SECTION_TOGGLE_VISIBILITY',
        'SECTION',
        sectionId,
        { name: section.name, newVisibility: !section.isVisible }
      )
      
      break
      
    case 'moveUp':
      // البحث عن القسم السابق في نفس المستوى
      const prevSection = await prisma.section.findFirst({
        where: {
          parentId: section.parentId,
          order: { lt: section.order },
        },
        orderBy: { order: 'desc' },
      })
      
      if (prevSection) {
        // تبديل الترتيب
        await prisma.$transaction([
          prisma.section.update({
            where: { id: sectionId },
            data: { order: prevSection.order },
          }),
          prisma.section.update({
            where: { id: prevSection.id },
            data: { order: section.order },
          }),
        ])
        
        result = { moved: true, direction: 'up' }
      } else {
        result = { moved: false, reason: 'already_first' }
      }
      
      await logApiAction(
        request,
        'SECTION_MOVE_UP',
        'SECTION',
        sectionId,
        { name: section.name, moved: result.moved }
      )
      
      break
      
    case 'moveDown':
      // البحث عن القسم التالي في نفس المستوى
      const nextSection = await prisma.section.findFirst({
        where: {
          parentId: section.parentId,
          order: { gt: section.order },
        },
        orderBy: { order: 'asc' },
      })
      
      if (nextSection) {
        // تبديل الترتيب
        await prisma.$transaction([
          prisma.section.update({
            where: { id: sectionId },
            data: { order: nextSection.order },
          }),
          prisma.section.update({
            where: { id: nextSection.id },
            data: { order: section.order },
          }),
        ])
        
        result = { moved: true, direction: 'down' }
      } else {
        result = { moved: false, reason: 'already_last' }
      }
      
      await logApiAction(
        request,
        'SECTION_MOVE_DOWN',
        'SECTION',
        sectionId,
        { name: section.name, moved: result.moved }
      )
      
      break
      
    case 'duplicate':
      // إنشاء نسخة من القسم
      const duplicateSlug = `${section.slug}-copy-${Date.now()}`
      
      result = await prisma.section.create({
        data: {
          name: `${section.name} - نسخة`,
          slug: duplicateSlug,
          description: section.description,
          color: section.color,
          parentId: section.parentId,
          order: section.order + 1,
          isVisible: false, // النسخة مخفية افتراضياً
          metaTitle: section.metaTitle,
          metaDescription: section.metaDescription,
        },
      })
      
      // تحديث ترتيب الأقسام التالية
      await prisma.section.updateMany({
        where: {
          parentId: section.parentId,
          order: { gt: section.order },
          id: { not: result.id },
        },
        data: { order: { increment: 1 } },
      })
      
      await logApiAction(
        request,
        'SECTION_DUPLICATE',
        'SECTION',
        result.id,
        { originalName: section.name, newName: result.name }
      )
      
      break
      
    case 'mergePosts':
      validateRequired(data, ['targetSectionId'])
      
      // التحقق من وجود القسم المستهدف
      const targetSection = await prisma.section.findUnique({
        where: { id: data.targetSectionId },
      })
      
      if (!targetSection) {
        throw new Error('القسم المستهدف غير موجود')
      }
      
      // نقل جميع المقالات للقسم المستهدف
      const moveResult = await prisma.post.updateMany({
        where: { sectionId },
        data: { sectionId: data.targetSectionId },
      })
      
      result = { 
        movedPosts: moveResult.count,
        targetSection: targetSection.name,
      }
      
      await logApiAction(
        request,
        'SECTION_MERGE_POSTS',
        'SECTION',
        sectionId,
        { 
          sourceName: section.name, 
          targetName: targetSection.name,
          movedPosts: moveResult.count,
        }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, 'تم تنفيذ العملية بنجاح')
})

