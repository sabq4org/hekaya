import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  logApiAction,
} from '@/lib/api-helpers'
import { AutomationStatus, AutomationType } from '@prisma/client'

// GET /api/automation - الحصول على قائمة المهام المجدولة
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requirePermission(request, Permission.VIEW_AUTOMATION)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const status = url.searchParams.get('status') as AutomationStatus | null
  const type = url.searchParams.get('type') as AutomationType | null
  const includeStats = url.searchParams.get('includeStats') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالحالة
  if (status) {
    where.status = status
  }
  
  // فلترة بالنوع
  if (type) {
    where.type = type
  }
  
  const includeOptions: Record<string, unknown> = {
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
        executions: true,
      },
    }
    
    includeOptions.executions = {
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        result: true,
        error: true,
      },
    }
  }
  
  const [automations, total] = await Promise.all([
    prisma.automation.findMany({
      where,
      include: includeOptions,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.automation.count({ where }),
  ])
  
  return successResponse(automations, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/automation - إنشاء مهمة مجدولة جديدة
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_AUTOMATION)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['name', 'type', 'schedule'])
  
  // التحقق من صحة الجدولة
  if (!isValidCronExpression(data.schedule)) {
    throw new Error('تعبير الجدولة غير صحيح')
  }
  
  // إنشاء المهمة
  const automation = await prisma.automation.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      schedule: data.schedule,
      config: data.config || {},
      status: AutomationStatus.ACTIVE,
      authorId: user.id,
      nextRunAt: calculateNextRun(data.schedule),
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
    'AUTOMATION_CREATE',
    'AUTOMATION',
    automation.id,
    { 
      name: automation.name,
      type: automation.type,
      schedule: automation.schedule,
    }
  )
  
  return successResponse(automation, 'تم إنشاء المهمة المجدولة بنجاح')
})

// PATCH /api/automation/bulk - عمليات جماعية على المهام
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_AUTOMATION)
  const { action, automationIds, data } = await request.json()
  
  validateRequired({ action, automationIds }, ['action', 'automationIds'])
  
  if (!Array.isArray(automationIds) || automationIds.length === 0) {
    throw new Error('يجب تحديد مهام للتعديل')
  }
  
  let result
  
  switch (action) {
    case 'activate':
      result = await prisma.automation.updateMany({
        where: { id: { in: automationIds } },
        data: { 
          status: AutomationStatus.ACTIVE,
          nextRunAt: new Date(), // تشغيل فوري
        },
      })
      
      await logApiAction(
        request,
        'AUTOMATION_BULK_ACTIVATE',
        'AUTOMATION',
        undefined,
        { automationIds, count: result.count }
      )
      
      break
      
    case 'pause':
      result = await prisma.automation.updateMany({
        where: { id: { in: automationIds } },
        data: { 
          status: AutomationStatus.PAUSED,
          nextRunAt: null,
        },
      })
      
      await logApiAction(
        request,
        'AUTOMATION_BULK_PAUSE',
        'AUTOMATION',
        undefined,
        { automationIds, count: result.count }
      )
      
      break
      
    case 'run':
      // تشغيل فوري للمهام
      const automationsToRun = await prisma.automation.findMany({
        where: { 
          id: { in: automationIds },
          status: AutomationStatus.ACTIVE,
        },
      })
      
      const runPromises = automationsToRun.map(automation => 
        executeAutomation(automation)
      )
      
      const runResults = await Promise.allSettled(runPromises)
      
      result = {
        executed: runResults.filter(r => r.status === 'fulfilled').length,
        failed: runResults.filter(r => r.status === 'rejected').length,
        total: automationsToRun.length,
      }
      
      await logApiAction(
        request,
        'AUTOMATION_BULK_RUN',
        'AUTOMATION',
        undefined,
        { 
          automationIds,
          executed: result.executed,
          failed: result.failed,
        }
      )
      
      break
      
    case 'updateSchedule':
      validateRequired(data, ['schedule'])
      
      if (!isValidCronExpression(data.schedule)) {
        throw new Error('تعبير الجدولة غير صحيح')
      }
      
      result = await prisma.automation.updateMany({
        where: { id: { in: automationIds } },
        data: { 
          schedule: data.schedule,
          nextRunAt: calculateNextRun(data.schedule),
        },
      })
      
      await logApiAction(
        request,
        'AUTOMATION_BULK_UPDATE_SCHEDULE',
        'AUTOMATION',
        undefined,
        { 
          automationIds,
          schedule: data.schedule,
          count: result.count,
        }
      )
      
      break
      
    case 'delete':
      // حذف المهام (فقط المتوقفة)
      result = await prisma.automation.deleteMany({
        where: { 
          id: { in: automationIds },
          status: { in: [AutomationStatus.PAUSED, AutomationStatus.FAILED] },
        },
      })
      
      await logApiAction(
        request,
        'AUTOMATION_BULK_DELETE',
        'AUTOMATION',
        undefined,
        { automationIds, count: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count || result.total} مهمة`)
})

// POST /api/automation/execute - تشغيل المهام المستحقة
export const POST_EXECUTE = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_AUTOMATION)
  
  // البحث عن المهام المستحقة للتشغيل
  const dueAutomations = await prisma.automation.findMany({
    where: {
      status: AutomationStatus.ACTIVE,
      nextRunAt: {
        lte: new Date(),
      },
    },
  })
  
  if (dueAutomations.length === 0) {
    return successResponse({ executed: 0 }, 'لا توجد مهام مستحقة للتشغيل')
  }
  
  // تشغيل المهام
  const results = await Promise.allSettled(
    dueAutomations.map(automation => executeAutomation(automation))
  )
  
  const executed = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  // تسجيل العملية
  await logApiAction(
    request,
    'AUTOMATION_EXECUTE_DUE',
    'AUTOMATION',
    undefined,
    { 
      total: dueAutomations.length,
      executed,
      failed,
    }
  )
  
  return successResponse({ 
    total: dueAutomations.length,
    executed,
    failed,
  }, `تم تشغيل ${executed} مهمة من أصل ${dueAutomations.length}`)
})

// GET /api/automation/stats - إحصائيات الأتمتة
export const GET_STATS = withErrorHandling(async (request: NextRequest) => {
  await requirePermission(request, Permission.VIEW_AUTOMATION)
  
  const [
    totalAutomations,
    automationsByStatus,
    automationsByType,
    recentExecutions,
    successRate,
  ] = await Promise.all([
    // إجمالي المهام
    prisma.automation.count(),
    
    // المهام حسب الحالة
    prisma.automation.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    
    // المهام حسب النوع
    prisma.automation.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
    
    // التنفيذات الحديثة (آخر 24 ساعة)
    prisma.automationExecution.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // معدل النجاح (آخر 7 أيام)
    getSuccessRate(),
  ])
  
  const stats = {
    totalAutomations,
    recentExecutions,
    successRate,
    automationsByStatus: automationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    automationsByType: automationsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<string, number>),
  }
  
  return successResponse(stats)
})

// دوال مساعدة

function isValidCronExpression(expression: string): boolean {
  // تحقق بسيط من تعبير cron
  // في التطبيق الحقيقي، يجب استخدام مكتبة متخصصة
  const parts = expression.split(' ')
  return parts.length === 5 || parts.length === 6
}

function calculateNextRun(schedule: string): Date {
  // حساب موعد التشغيل التالي بناءً على تعبير cron
  // هذا تنفيذ مبسط - في التطبيق الحقيقي، استخدم مكتبة cron
  
  const now = new Date()
  
  // مثال بسيط: كل ساعة
  if (schedule === '0 * * * *') {
    return new Date(now.getTime() + 60 * 60 * 1000)
  }
  
  // مثال: كل يوم في منتصف الليل
  if (schedule === '0 0 * * *') {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }
  
  // افتراضي: كل ساعة
  return new Date(now.getTime() + 60 * 60 * 1000)
}

async function executeAutomation(automation: { id: string; type: string; config: Record<string, unknown>; schedule: string }): Promise<void> {
  // إنشاء سجل تنفيذ
  const execution = await prisma.automationExecution.create({
    data: {
      automationId: automation.id,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  })
  
  try {
    let result: Record<string, unknown> = {}
    
    // تنفيذ المهمة حسب النوع
    switch (automation.type) {
      case AutomationType.PUBLISH_SCHEDULED:
        result = await publishScheduledPosts()
        break
        
      case AutomationType.ARCHIVE_OLD:
        result = await archiveOldPosts(automation.config)
        break
        
      case AutomationType.CLEANUP_SPAM:
        result = await cleanupSpamComments()
        break
        
      case AutomationType.SEND_NEWSLETTER:
        result = await sendScheduledNewsletters()
        break
        
      case AutomationType.BACKUP_DATA:
        result = await backupData(automation.config)
        break
        
      case AutomationType.UPDATE_STATS:
        result = await updateStatistics()
        break
        
      case AutomationType.CLEANUP_LOGS:
        result = await cleanupOldLogs(automation.config)
        break
        
      default:
        throw new Error(`نوع المهمة غير مدعوم: ${automation.type}`)
    }
    
    // تحديث سجل التنفيذ بالنجاح
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result,
      },
    })
    
    // تحديث موعد التشغيل التالي
    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt: calculateNextRun(automation.schedule),
        status: AutomationStatus.ACTIVE,
      },
    })
    
  } catch (error) {
    // تحديث سجل التنفيذ بالفشل
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
      },
    })
    
    // تحديث حالة المهمة
    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        lastRunAt: new Date(),
        status: AutomationStatus.FAILED,
      },
    })
    
    throw error
  }
}

// دوال تنفيذ المهام المختلفة

async function publishScheduledPosts(): Promise<any> {
  // نشر المقالات المجدولة
  const scheduledPosts = await prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      publishedAt: {
        lte: new Date(),
      },
    },
  })
  
  const publishedCount = await prisma.post.updateMany({
    where: {
      id: { in: scheduledPosts.map(p => p.id) },
    },
    data: {
      status: 'PUBLISHED',
    },
  })
  
  return { publishedPosts: publishedCount.count }
}

async function archiveOldPosts(config: Record<string, unknown>): Promise<any> {
  // أرشفة المقالات القديمة
  const daysOld = config.daysOld || 365
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
  
  const archivedCount = await prisma.post.updateMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        lt: cutoffDate,
      },
      views: {
        lt: config.minViews || 100,
      },
    },
    data: {
      status: 'ARCHIVED',
    },
  })
  
  return { archivedPosts: archivedCount.count }
}

async function cleanupSpamComments(): Promise<any> {
  // حذف التعليقات المصنفة كسبام
  const deletedCount = await prisma.comment.deleteMany({
    where: {
      status: 'SPAM',
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // أقدم من 30 يوم
      },
    },
  })
  
  return { deletedComments: deletedCount.count }
}

async function sendScheduledNewsletters(): Promise<any> {
  // إرسال النشرات البريدية المجدولة
  const scheduledCampaigns = await prisma.newsletterCampaign.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: {
        lte: new Date(),
      },
    },
  })
  
  // في التطبيق الحقيقي، هنا يتم إرسال الرسائل فعلياً
  
  const sentCount = await prisma.newsletterCampaign.updateMany({
    where: {
      id: { in: scheduledCampaigns.map(c => c.id) },
    },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
  })
  
  return { sentCampaigns: sentCount.count }
}

async function backupData(config: Record<string, unknown>): Promise<any> {
  // نسخ احتياطي للبيانات
  // في التطبيق الحقيقي، هنا يتم إنشاء نسخة احتياطية
  
  return { 
    backupCreated: true,
    timestamp: new Date().toISOString(),
    type: config.type || 'full',
  }
}

async function updateStatistics(): Promise<any> {
  // تحديث الإحصائيات
  const [postsCount, usersCount, commentsCount] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.comment.count({ where: { status: 'APPROVED' } }),
  ])
  
  // تحديث إعدادات الإحصائيات
  await Promise.all([
    prisma.setting.upsert({
      where: { key: 'stats.total_posts' },
      update: { value: postsCount.toString() },
      create: {
        key: 'stats.total_posts',
        value: postsCount.toString(),
        type: 'NUMBER',
        category: 'stats',
        description: 'إجمالي المقالات المنشورة',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'stats.total_users' },
      update: { value: usersCount.toString() },
      create: {
        key: 'stats.total_users',
        value: usersCount.toString(),
        type: 'NUMBER',
        category: 'stats',
        description: 'إجمالي المستخدمين النشطين',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'stats.total_comments' },
      update: { value: commentsCount.toString() },
      create: {
        key: 'stats.total_comments',
        value: commentsCount.toString(),
        type: 'NUMBER',
        category: 'stats',
        description: 'إجمالي التعليقات المعتمدة',
      },
    }),
  ])
  
  return { 
    updatedStats: {
      posts: postsCount,
      users: usersCount,
      comments: commentsCount,
    },
  }
}

async function cleanupOldLogs(config: Record<string, unknown>): Promise<any> {
  // تنظيف السجلات القديمة
  const daysOld = config.daysOld || 90
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
  
  const deletedCount = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })
  
  return { deletedLogs: deletedCount.count }
}

async function getSuccessRate(): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const [total, successful] = await Promise.all([
    prisma.automationExecution.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.automationExecution.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'COMPLETED',
      },
    }),
  ])
  
  return total > 0 ? Math.round((successful / total) * 100) : 0
}

