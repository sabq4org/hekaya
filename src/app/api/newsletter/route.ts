import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/newsletter - الحصول على قائمة المشتركين
export const GET = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.VIEW_NEWSLETTER)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const status = url.searchParams.get('status') as SubscriberStatus | null
  const source = url.searchParams.get('source')
  const includeStats = url.searchParams.get('includeStats') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالحالة
  if (status) {
    where.status = status
  }
  
  // فلترة بالمصدر
  if (source) {
    where.source = source
  }
  
  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.newsletterSubscriber.count({ where }),
  ])
  
  let stats = undefined
  if (includeStats) {
    const [
      totalSubscribers,
      activeSubscribers,
      subscribersByStatus,
      subscribersBySource,
      recentSubscribers,
    ] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.ACTIVE } }),
      prisma.newsletterSubscriber.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.newsletterSubscriber.groupBy({
        by: ['source'],
        _count: { source: true },
      }),
      prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // آخر 7 أيام
          },
        },
      }),
    ])
    
    stats = {
      totalSubscribers,
      activeSubscribers,
      recentSubscribers,
      subscribersByStatus: subscribersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      subscribersBySource: subscribersBySource.reduce((acc, item) => {
        acc[item.source] = item._count.source
        return acc
      }, {} as Record<string, number>),
    }
  }
  
  return successResponse(subscribers, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    stats,
  })
})

// POST /api/newsletter - إضافة مشترك جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['email'])
  
  // التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('البريد الإلكتروني غير صحيح')
  }
  
  // التحقق من عدم وجود المشترك
  const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: data.email },
  })
  
  if (existingSubscriber) {
    if (existingSubscriber.status === SubscriberStatus.ACTIVE) {
      throw new Error('البريد الإلكتروني مشترك بالفعل')
    } else if (existingSubscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      // إعادة تفعيل المشترك
      const reactivatedSubscriber = await prisma.newsletterSubscriber.update({
        where: { email: data.email },
        data: {
          status: SubscriberStatus.ACTIVE,
          name: data.name || existingSubscriber.name,
          source: data.source || 'resubscribe',
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      })
      
      return successResponse(reactivatedSubscriber, 'تم إعادة تفعيل الاشتراك بنجاح')
    }
  }
  
  // إنشاء مشترك جديد
  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email: data.email,
      name: data.name,
      source: data.source || 'website',
      status: SubscriberStatus.ACTIVE,
      subscribedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 '127.0.0.1',
      userAgent: request.headers.get('user-agent') || '',
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'NEWSLETTER_SUBSCRIBE',
    'NEWSLETTER_SUBSCRIBER',
    subscriber.id,
    { 
      email: subscriber.email,
      source: subscriber.source,
    }
  )
  
  return successResponse(subscriber, 'تم الاشتراك في النشرة البريدية بنجاح')
})

// PATCH /api/newsletter/bulk - عمليات جماعية على المشتركين
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_NEWSLETTER)
  const { action, subscriberIds, data } = await request.json()
  
  validateRequired({ action, subscriberIds }, ['action', 'subscriberIds'])
  
  if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) {
    throw new Error('يجب تحديد مشتركين للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'activate':
      result = await prisma.newsletterSubscriber.updateMany({
        where: { id: { in: subscriberIds } },
        data: { 
          status: SubscriberStatus.ACTIVE,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_ACTIVATE',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, count: result.count }
      )
      
      break
      
    case 'unsubscribe':
      result = await prisma.newsletterSubscriber.updateMany({
        where: { id: { in: subscriberIds } },
        data: { 
          status: SubscriberStatus.UNSUBSCRIBED,
          unsubscribedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_UNSUBSCRIBE',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, count: result.count }
      )
      
      break
      
    case 'block':
      result = await prisma.newsletterSubscriber.updateMany({
        where: { id: { in: subscriberIds } },
        data: { 
          status: SubscriberStatus.BLOCKED,
          unsubscribedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_BLOCK',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, count: result.count }
      )
      
      break
      
    case 'updateSource':
      validateRequired(data, ['source'])
      
      result = await prisma.newsletterSubscriber.updateMany({
        where: { id: { in: subscriberIds } },
        data: { source: data.source },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_UPDATE_SOURCE',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, source: data.source, count: result.count }
      )
      
      break
      
    case 'delete':
      result = await prisma.newsletterSubscriber.deleteMany({
        where: { id: { in: subscriberIds } },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_DELETE',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, count: result.count }
      )
      
      break
      
    case 'export':
      // تصدير بيانات المشتركين
      const exportData = await prisma.newsletterSubscriber.findMany({
        where: { id: { in: subscriberIds } },
        select: {
          email: true,
          name: true,
          status: true,
          source: true,
          subscribedAt: true,
          unsubscribedAt: true,
        },
      })
      
      result = { exportData, count: exportData.length }
      
      await logApiAction(
        request,
        'NEWSLETTER_BULK_EXPORT',
        'NEWSLETTER_SUBSCRIBER',
        undefined,
        { subscriberIds, count: exportData.length }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} مشترك`)
})

// DELETE /api/newsletter/unsubscribed - حذف جميع المشتركين الملغيين
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_NEWSLETTER)
  
  // حذف المشتركين الملغيين
  const result = await prisma.newsletterSubscriber.deleteMany({
    where: { 
      status: { 
        in: [SubscriberStatus.UNSUBSCRIBED, SubscriberStatus.BLOCKED] 
      } 
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'NEWSLETTER_DELETE_UNSUBSCRIBED',
    'NEWSLETTER_SUBSCRIBER',
    undefined,
    { deletedCount: result.count }
  )
  
  return successResponse(result, `تم حذف ${result.count} مشترك ملغي`)
})

