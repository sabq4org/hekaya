import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/notifications - الحصول على إشعارات المستخدم
export const GET = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const status = url.searchParams.get('status') as NotificationStatus | null
  const type = url.searchParams.get('type') as NotificationType | null
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {
    userId: user.id,
  }
  
  // فلترة بالحالة
  if (status) {
    where.status = status
  } else if (unreadOnly) {
    where.status = NotificationStatus.UNREAD
  }
  
  // فلترة بالنوع
  if (type) {
    where.type = type
  }
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { message: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: user.id,
        status: NotificationStatus.UNREAD,
      },
    }),
  ])
  
  return successResponse(notifications, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    unreadCount,
  })
})

// POST /api/notifications - إنشاء إشعار جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.SEND_NOTIFICATION)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['title', 'message', 'type'])
  
  // تحديد المستقبلين
  let userIds: string[] = []
  
  if (data.userId) {
    // إشعار لمستخدم واحد
    userIds = [data.userId]
  } else if (data.userIds && Array.isArray(data.userIds)) {
    // إشعار لمستخدمين محددين
    userIds = data.userIds
  } else if (data.role) {
    // إشعار لجميع المستخدمين في دور معين
    const users = await prisma.user.findMany({
      where: { 
        role: data.role,
        isActive: true,
      },
      select: { id: true },
    })
    userIds = users.map(u => u.id)
  } else if (data.broadcast) {
    // إشعار لجميع المستخدمين النشطين
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    })
    userIds = users.map(u => u.id)
  } else {
    throw new Error('يجب تحديد المستقبلين')
  }
  
  if (userIds.length === 0) {
    throw new Error('لا يوجد مستقبلين للإشعار')
  }
  
  // إنشاء الإشعارات
  const notifications = await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      status: NotificationStatus.UNREAD,
      data: data.data || {},
      actionUrl: data.actionUrl,
      senderId: user.id,
    })),
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'NOTIFICATION_SEND',
    'NOTIFICATION',
    undefined,
    { 
      title: data.title,
      type: data.type,
      recipientCount: userIds.length,
      broadcast: data.broadcast || false,
    }
  )
  
  return successResponse(
    { count: notifications.count },
    `تم إرسال الإشعار إلى ${notifications.count} مستخدم`
  )
})

// PATCH /api/notifications/bulk - عمليات جماعية على الإشعارات
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  const { action, notificationIds } = await request.json()
  
  validateRequired({ action }, ['action'])
  
  // بناء شروط التحديث
  const where: Record<string, unknown> = {
    userId: user.id, // المستخدم يمكنه تعديل إشعاراته فقط
  }
  
  if (notificationIds && Array.isArray(notificationIds)) {
    where.id = { in: notificationIds }
  }
  
  let result
  
  switch (action) {
    case 'markRead':
      result = await prisma.notification.updateMany({
        where,
        data: { 
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'NOTIFICATIONS_MARK_READ',
        'NOTIFICATION',
        undefined,
        { count: result.count }
      )
      
      break
      
    case 'markUnread':
      result = await prisma.notification.updateMany({
        where,
        data: { 
          status: NotificationStatus.UNREAD,
          readAt: null,
        },
      })
      
      await logApiAction(
        request,
        'NOTIFICATIONS_MARK_UNREAD',
        'NOTIFICATION',
        undefined,
        { count: result.count }
      )
      
      break
      
    case 'archive':
      result = await prisma.notification.updateMany({
        where,
        data: { 
          status: NotificationStatus.ARCHIVED,
          archivedAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'NOTIFICATIONS_ARCHIVE',
        'NOTIFICATION',
        undefined,
        { count: result.count }
      )
      
      break
      
    case 'delete':
      result = await prisma.notification.deleteMany({
        where,
      })
      
      await logApiAction(
        request,
        'NOTIFICATIONS_DELETE',
        'NOTIFICATION',
        undefined,
        { count: result.count }
      )
      
      break
      
    case 'markAllRead':
      // تحديد إشعارات غير مقروءة فقط
      where.status = NotificationStatus.UNREAD
      
      result = await prisma.notification.updateMany({
        where,
        data: { 
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      })
      
      await logApiAction(
        request,
        'NOTIFICATIONS_MARK_ALL_READ',
        'NOTIFICATION',
        undefined,
        { count: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} إشعار`)
})

// GET /api/notifications/stats - إحصائيات الإشعارات
export const GET_STATS = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  
  const [
    totalNotifications,
    unreadCount,
    notificationsByType,
    notificationsByStatus,
    recentNotifications,
  ] = await Promise.all([
    // إجمالي الإشعارات
    prisma.notification.count({
      where: { userId: user.id },
    }),
    
    // الإشعارات غير المقروءة
    prisma.notification.count({
      where: { 
        userId: user.id,
        status: NotificationStatus.UNREAD,
      },
    }),
    
    // الإشعارات حسب النوع
    prisma.notification.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: { type: true },
    }),
    
    // الإشعارات حسب الحالة
    prisma.notification.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: { status: true },
    }),
    
    // الإشعارات الحديثة (آخر 7 أيام)
    prisma.notification.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])
  
  const stats = {
    totalNotifications,
    unreadCount,
    recentNotifications,
    notificationsByType: notificationsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<string, number>),
    notificationsByStatus: notificationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
  }
  
  return successResponse(stats)
})

// POST /api/notifications/system - إرسال إشعارات النظام
export const POST_SYSTEM = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.SEND_NOTIFICATION)
  const { event, data } = await request.json()
  
  validateRequired({ event }, ['event'])
  
  let notifications: Record<string, unknown>[] = []
  
  switch (event) {
    case 'POST_PUBLISHED':
      // إشعار المتابعين عند نشر مقال جديد
      notifications = await createPostPublishedNotifications(data.postId, data.authorId)
      break
      
    case 'COMMENT_RECEIVED':
      // إشعار كاتب المقال عند تلقي تعليق
      notifications = await createCommentReceivedNotifications(data.commentId, data.postId)
      break
      
    case 'COMMENT_REPLY':
      // إشعار صاحب التعليق عند الرد عليه
      notifications = await createCommentReplyNotifications(data.replyId, data.parentCommentId)
      break
      
    case 'USER_MENTIONED':
      // إشعار المستخدم عند ذكره
      notifications = await createUserMentionedNotifications(data.mentionedUserId, data.contentId, data.contentType)
      break
      
    case 'NEWSLETTER_SENT':
      // إشعار المدراء عند إرسال نشرة بريدية
      notifications = await createNewsletterSentNotifications(data.campaignId)
      break
      
    case 'SYSTEM_MAINTENANCE':
      // إشعار جميع المستخدمين بصيانة النظام
      notifications = await createSystemMaintenanceNotifications(data.message, data.scheduledAt)
      break
      
    case 'SECURITY_ALERT':
      // إشعار أمني للمدراء
      notifications = await createSecurityAlertNotifications(data.alertType, data.details)
      break
      
    default:
      throw new Error(`نوع الحدث غير مدعوم: ${event}`)
  }
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SYSTEM_NOTIFICATION_SEND',
    'NOTIFICATION',
    undefined,
    { 
      event,
      notificationCount: notifications.length,
      data,
    }
  )
  
  return successResponse(
    { count: notifications.length },
    `تم إرسال ${notifications.length} إشعار نظام`
  )
})

// دوال إنشاء الإشعارات المختلفة

async function createPostPublishedNotifications(postId: string, authorId: string): Promise<any[]> {
  // الحصول على معلومات المقال
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, name: true },
      },
      section: {
        select: { id: true, name: true },
      },
    },
  })
  
  if (!post) return []
  
  // الحصول على المتابعين (في التطبيق الحقيقي، يجب إضافة نظام متابعة)
  // هنا نرسل للمحررين والمدراء كمثال
  const recipients = await prisma.user.findMany({
    where: {
      role: { in: [Role.ADMIN, Role.EDITOR] },
      isActive: true,
      id: { not: authorId }, // عدم إرسال للكاتب نفسه
    },
    select: { id: true },
  })
  
  const notifications = await prisma.notification.createMany({
    data: recipients.map(recipient => ({
      userId: recipient.id,
      title: 'مقال جديد منشور',
      message: `تم نشر مقال جديد "${post.title}" بواسطة ${post.author.name}`,
      type: NotificationType.POST_PUBLISHED,
      status: NotificationStatus.UNREAD,
      data: {
        postId: post.id,
        postTitle: post.title,
        authorId: post.author.id,
        authorName: post.author.name,
        sectionName: post.section?.name,
      },
      actionUrl: `/articles/${post.slug}`,
      senderId: authorId,
    })),
  })
  
  return Array(notifications.count).fill(null)
}

async function createCommentReceivedNotifications(commentId: string, postId: string): Promise<any[]> {
  // الحصول على معلومات التعليق والمقال
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: { id: true, name: true },
      },
      post: {
        select: { 
          id: true, 
          title: true, 
          slug: true,
          authorId: true,
          author: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
  
  if (!comment || comment.authorId === comment.post.authorId) return []
  
  const notification = await prisma.notification.create({
    data: {
      userId: comment.post.authorId,
      title: 'تعليق جديد على مقالك',
      message: `علق ${comment.author.name} على مقالك "${comment.post.title}"`,
      type: NotificationType.COMMENT_RECEIVED,
      status: NotificationStatus.UNREAD,
      data: {
        commentId: comment.id,
        postId: comment.post.id,
        postTitle: comment.post.title,
        commenterName: comment.author.name,
        commentContent: comment.content.substring(0, 100),
      },
      actionUrl: `/articles/${comment.post.slug}#comment-${comment.id}`,
      senderId: comment.authorId,
    },
  })
  
  return [notification]
}

async function createCommentReplyNotifications(replyId: string, parentCommentId: string): Promise<any[]> {
  // الحصول على معلومات الرد والتعليق الأصلي
  const reply = await prisma.comment.findUnique({
    where: { id: replyId },
    include: {
      author: {
        select: { id: true, name: true },
      },
      parent: {
        select: {
          id: true,
          authorId: true,
          author: {
            select: { id: true, name: true },
          },
        },
      },
      post: {
        select: { id: true, title: true, slug: true },
      },
    },
  })
  
  if (!reply || !reply.parent || reply.authorId === reply.parent.authorId) return []
  
  const notification = await prisma.notification.create({
    data: {
      userId: reply.parent.authorId,
      title: 'رد على تعليقك',
      message: `رد ${reply.author.name} على تعليقك في مقال "${reply.post.title}"`,
      type: NotificationType.COMMENT_REPLY,
      status: NotificationStatus.UNREAD,
      data: {
        replyId: reply.id,
        parentCommentId: reply.parent.id,
        postId: reply.post.id,
        postTitle: reply.post.title,
        replierName: reply.author.name,
        replyContent: reply.content.substring(0, 100),
      },
      actionUrl: `/articles/${reply.post.slug}#comment-${reply.id}`,
      senderId: reply.authorId,
    },
  })
  
  return [notification]
}

async function createUserMentionedNotifications(mentionedUserId: string, contentId: string, contentType: string): Promise<any[]> {
  // إشعار المستخدم المذكور
  const notification = await prisma.notification.create({
    data: {
      userId: mentionedUserId,
      title: 'تم ذكرك',
      message: `تم ذكرك في ${contentType === 'post' ? 'مقال' : 'تعليق'}`,
      type: NotificationType.USER_MENTIONED,
      status: NotificationStatus.UNREAD,
      data: {
        contentId,
        contentType,
      },
      actionUrl: contentType === 'post' ? `/articles/${contentId}` : `/comments/${contentId}`,
    },
  })
  
  return [notification]
}

async function createNewsletterSentNotifications(campaignId: string): Promise<any[]> {
  // إشعار المدراء بإرسال النشرة البريدية
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: campaignId },
    select: { id: true, subject: true },
  })
  
  if (!campaign) return []
  
  const admins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
      isActive: true,
    },
    select: { id: true },
  })
  
  const notifications = await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      title: 'تم إرسال النشرة البريدية',
      message: `تم إرسال النشرة البريدية "${campaign.subject}" بنجاح`,
      type: NotificationType.NEWSLETTER_SENT,
      status: NotificationStatus.UNREAD,
      data: {
        campaignId: campaign.id,
        campaignSubject: campaign.subject,
      },
      actionUrl: `/admin/newsletter/campaigns/${campaign.id}`,
    })),
  })
  
  return Array(notifications.count).fill(null)
}

async function createSystemMaintenanceNotifications(message: string, scheduledAt: Date): Promise<any[]> {
  // إشعار جميع المستخدمين النشطين بصيانة النظام
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  })
  
  const notifications = await prisma.notification.createMany({
    data: users.map(user => ({
      userId: user.id,
      title: 'صيانة مجدولة للنظام',
      message: message || `سيتم إجراء صيانة للنظام في ${scheduledAt.toLocaleString('ar')}`,
      type: NotificationType.SYSTEM_MAINTENANCE,
      status: NotificationStatus.UNREAD,
      data: {
        scheduledAt: scheduledAt.toISOString(),
      },
    })),
  })
  
  return Array(notifications.count).fill(null)
}

async function createSecurityAlertNotifications(alertType: string, details: Record<string, unknown>): Promise<any[]> {
  // إشعار المدراء بتنبيه أمني
  const admins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
      isActive: true,
    },
    select: { id: true },
  })
  
  const notifications = await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      title: 'تنبيه أمني',
      message: `تم اكتشاف ${alertType} - يرجى المراجعة فوراً`,
      type: NotificationType.SECURITY_ALERT,
      status: NotificationStatus.UNREAD,
      data: {
        alertType,
        details,
        timestamp: new Date().toISOString(),
      },
      actionUrl: '/admin/security/alerts',
    })),
  })
  
  return Array(notifications.count).fill(null)
}

