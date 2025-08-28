import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requirePermission,
  parsePagination,
  parseFilters,
  validateRequired,
  logApiAction,
  ApiErrors,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'
import { CampaignStatus, SubscriberStatus } from '@prisma/client'

// GET /api/newsletter/campaigns - الحصول على قائمة الحملات
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.VIEW_NEWSLETTER)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const status = url.searchParams.get('status') as CampaignStatus | null
  const includeStats = url.searchParams.get('includeStats') === 'true'
  
  // بناء شروط البحث
  const where: any = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { subject: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالحالة
  if (status) {
    where.status = status
  }
  
  const includeOptions: any = {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  }
  
  if (includeStats) {
    includeOptions._count = {
      select: {
        deliveries: true,
      },
    }
  }
  
  const [campaigns, total] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      where,
      include: includeOptions,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.newsletterCampaign.count({ where }),
  ])
  
  return successResponse(campaigns, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/newsletter/campaigns - إنشاء حملة جديدة
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.MANAGE_NEWSLETTER)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['subject', 'content'])
  
  // إنشاء الحملة
  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject: data.subject,
      content: data.content,
      authorId: user.id,
      status: CampaignStatus.DRAFT,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      template: data.template || 'default',
      metadata: data.metadata || {},
    },
    include: {
      author: {
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
    'NEWSLETTER_CAMPAIGN_CREATE',
    'NEWSLETTER_CAMPAIGN',
    campaign.id,
    { 
      subject: campaign.subject,
      status: campaign.status,
    }
  )
  
  return successResponse(campaign, 'تم إنشاء الحملة بنجاح')
})

// PATCH /api/newsletter/campaigns/bulk - عمليات جماعية على الحملات
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.MANAGE_NEWSLETTER)
  const { action, campaignIds, data } = await request.json()
  
  validateRequired({ action, campaignIds }, ['action', 'campaignIds'])
  
  if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
    throw new Error('يجب تحديد حملات للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'send':
      // إرسال الحملات
      const campaignsToSend = await prisma.newsletterCampaign.findMany({
        where: { 
          id: { in: campaignIds },
          status: { in: [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED] },
        },
      })
      
      if (campaignsToSend.length === 0) {
        throw new Error('لا توجد حملات قابلة للإرسال')
      }
      
      // تحديث حالة الحملات إلى "قيد الإرسال"
      await prisma.newsletterCampaign.updateMany({
        where: { id: { in: campaignsToSend.map(c => c.id) } },
        data: { 
          status: CampaignStatus.SENDING,
          sentAt: new Date(),
        },
      })
      
      // الحصول على المشتركين النشطين
      const activeSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: SubscriberStatus.ACTIVE },
      })
      
      // إنشاء سجلات التسليم لكل حملة ومشترك
      const deliveries = []
      for (const campaign of campaignsToSend) {
        for (const subscriber of activeSubscribers) {
          deliveries.push({
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: 'PENDING' as const,
          })
        }
      }
      
      // إدراج سجلات التسليم
      await prisma.newsletterDelivery.createMany({
        data: deliveries,
        skipDuplicates: true,
      })
      
      // في التطبيق الحقيقي، هنا يتم إرسال الرسائل فعلياً
      // وتحديث حالة التسليم حسب النتيجة
      
      // تحديث حالة الحملات إلى "مرسلة"
      await prisma.newsletterCampaign.updateMany({
        where: { id: { in: campaignsToSend.map(c => c.id) } },
        data: { status: CampaignStatus.SENT },
      })
      
      result = { 
        sentCampaigns: campaignsToSend.length,
        totalDeliveries: deliveries.length,
      }
      
      await logApiAction(
        request,
        'NEWSLETTER_CAMPAIGNS_BULK_SEND',
        'NEWSLETTER_CAMPAIGN',
        undefined,
        { 
          campaignIds: campaignsToSend.map(c => c.id),
          count: campaignsToSend.length,
          totalDeliveries: deliveries.length,
        }
      )
      
      break
      
    case 'schedule':
      validateRequired(data, ['scheduledFor'])
      
      result = await prisma.newsletterCampaign.updateMany({
        where: { 
          id: { in: campaignIds },
          status: CampaignStatus.DRAFT,
        },
        data: { 
          status: CampaignStatus.SCHEDULED,
          scheduledFor: new Date(data.scheduledFor),
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_CAMPAIGNS_BULK_SCHEDULE',
        'NEWSLETTER_CAMPAIGN',
        undefined,
        { 
          campaignIds,
          scheduledFor: data.scheduledFor,
          count: result.count,
        }
      )
      
      break
      
    case 'unschedule':
      result = await prisma.newsletterCampaign.updateMany({
        where: { 
          id: { in: campaignIds },
          status: CampaignStatus.SCHEDULED,
        },
        data: { 
          status: CampaignStatus.DRAFT,
          scheduledFor: null,
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_CAMPAIGNS_BULK_UNSCHEDULE',
        'NEWSLETTER_CAMPAIGN',
        undefined,
        { campaignIds, count: result.count }
      )
      
      break
      
    case 'duplicate':
      // تكرار الحملات
      const campaignsToDuplicate = await prisma.newsletterCampaign.findMany({
        where: { id: { in: campaignIds } },
      })
      
      const duplicatedCampaigns = []
      for (const campaign of campaignsToDuplicate) {
        const duplicated = await prisma.newsletterCampaign.create({
          data: {
            subject: `${campaign.subject} - نسخة`,
            content: campaign.content,
            authorId: user.id,
            status: CampaignStatus.DRAFT,
            template: campaign.template,
            metadata: campaign.metadata,
          },
        })
        duplicatedCampaigns.push(duplicated)
      }
      
      result = { 
        duplicatedCampaigns,
        count: duplicatedCampaigns.length,
      }
      
      await logApiAction(
        request,
        'NEWSLETTER_CAMPAIGNS_BULK_DUPLICATE',
        'NEWSLETTER_CAMPAIGN',
        undefined,
        { 
          originalCampaignIds: campaignIds,
          duplicatedCampaignIds: duplicatedCampaigns.map(c => c.id),
          count: duplicatedCampaigns.length,
        }
      )
      
      break
      
    case 'delete':
      // حذف الحملات (فقط المسودات والمجدولة)
      result = await prisma.newsletterCampaign.deleteMany({
        where: { 
          id: { in: campaignIds },
          status: { in: [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED] },
        },
      })
      
      await logApiAction(
        request,
        'NEWSLETTER_CAMPAIGNS_BULK_DELETE',
        'NEWSLETTER_CAMPAIGN',
        undefined,
        { campaignIds, count: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} حملة`)
})

// GET /api/newsletter/campaigns/stats - إحصائيات الحملات
export const GET_STATS = withErrorHandling(async (request: NextRequest) => {
  await requirePermission(request, Permission.VIEW_NEWSLETTER)
  
  const [
    totalCampaigns,
    campaignsByStatus,
    recentCampaigns,
    totalDeliveries,
    deliveryStats,
  ] = await Promise.all([
    // إجمالي الحملات
    prisma.newsletterCampaign.count(),
    
    // الحملات حسب الحالة
    prisma.newsletterCampaign.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    
    // الحملات الحديثة (آخر 30 يوم)
    prisma.newsletterCampaign.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // إجمالي التسليمات
    prisma.newsletterDelivery.count(),
    
    // إحصائيات التسليم
    prisma.newsletterDelivery.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])
  
  const stats = {
    totalCampaigns,
    recentCampaigns,
    totalDeliveries,
    campaignsByStatus: campaignsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    deliveryStats: deliveryStats.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
  }
  
  return successResponse(stats)
})

