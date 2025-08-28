import { prisma } from './prisma'

export interface AuditLogData {
  actorId?: string
  action: string
  target: string
  targetId?: string
  meta?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// تسجيل عملية في سجل التدقيق
export async function logAuditEvent(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        target: data.target,
        targetId: data.targetId,
        meta: data.meta,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('خطأ في تسجيل العملية:', error)
  }
}

// أنواع العمليات المختلفة
export const AuditActions = {
  // عمليات المقالات
  POST_CREATE: 'POST_CREATE',
  POST_UPDATE: 'POST_UPDATE',
  POST_DELETE: 'POST_DELETE',
  POST_PUBLISH: 'POST_PUBLISH',
  POST_ARCHIVE: 'POST_ARCHIVE',
  POST_RESTORE: 'POST_RESTORE',
  POST_SCHEDULE: 'POST_SCHEDULE',
  
  // عمليات الأقسام
  SECTION_CREATE: 'SECTION_CREATE',
  SECTION_UPDATE: 'SECTION_UPDATE',
  SECTION_DELETE: 'SECTION_DELETE',
  
  // عمليات الوسوم
  TAG_CREATE: 'TAG_CREATE',
  TAG_UPDATE: 'TAG_UPDATE',
  TAG_DELETE: 'TAG_DELETE',
  TAG_MERGE: 'TAG_MERGE',
  
  // عمليات التعليقات
  COMMENT_APPROVE: 'COMMENT_APPROVE',
  COMMENT_REJECT: 'COMMENT_REJECT',
  COMMENT_DELETE: 'COMMENT_DELETE',
  COMMENT_SPAM: 'COMMENT_SPAM',
  
  // عمليات المستخدمين
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_SUSPEND: 'USER_SUSPEND',
  USER_ACTIVATE: 'USER_ACTIVATE',
  USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
  
  // عمليات الوسائط
  MEDIA_UPLOAD: 'MEDIA_UPLOAD',
  MEDIA_DELETE: 'MEDIA_DELETE',
  
  // عمليات النشرة البريدية
  NEWSLETTER_SEND: 'NEWSLETTER_SEND',
  SUBSCRIBER_ADD: 'SUBSCRIBER_ADD',
  SUBSCRIBER_REMOVE: 'SUBSCRIBER_REMOVE',
  
  // عمليات الإعدادات
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  
  // عمليات النظام
  BACKUP_CREATE: 'BACKUP_CREATE',
  BACKUP_RESTORE: 'BACKUP_RESTORE',
  
  // عمليات الأمان
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
} as const

// أهداف العمليات
export const AuditTargets = {
  POST: 'POST',
  SECTION: 'SECTION',
  TAG: 'TAG',
  COMMENT: 'COMMENT',
  USER: 'USER',
  MEDIA: 'MEDIA',
  NEWSLETTER: 'NEWSLETTER',
  SETTINGS: 'SETTINGS',
  SYSTEM: 'SYSTEM',
} as const

// مساعدات لتسجيل عمليات محددة
export const auditHelpers = {
  // تسجيل إنشاء مقال
  logPostCreate: (actorId: string, postId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.POST_CREATE,
      target: AuditTargets.POST,
      targetId: postId,
      meta: { title: postTitle },
      ipAddress,
    }),

  // تسجيل تحديث مقال
  logPostUpdate: (actorId: string, postId: string, postTitle: string, changes: Record<string, any>, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.POST_UPDATE,
      target: AuditTargets.POST,
      targetId: postId,
      meta: { title: postTitle, changes },
      ipAddress,
    }),

  // تسجيل نشر مقال
  logPostPublish: (actorId: string, postId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.POST_PUBLISH,
      target: AuditTargets.POST,
      targetId: postId,
      meta: { title: postTitle },
      ipAddress,
    }),

  // تسجيل حذف مقال
  logPostDelete: (actorId: string, postId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.POST_DELETE,
      target: AuditTargets.POST,
      targetId: postId,
      meta: { title: postTitle },
      ipAddress,
    }),

  // تسجيل إنشاء قسم
  logSectionCreate: (actorId: string, sectionId: string, sectionName: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.SECTION_CREATE,
      target: AuditTargets.SECTION,
      targetId: sectionId,
      meta: { name: sectionName },
      ipAddress,
    }),

  // تسجيل تحديث قسم
  logSectionUpdate: (actorId: string, sectionId: string, sectionName: string, changes: Record<string, any>, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.SECTION_UPDATE,
      target: AuditTargets.SECTION,
      targetId: sectionId,
      meta: { name: sectionName, changes },
      ipAddress,
    }),

  // تسجيل حذف قسم
  logSectionDelete: (actorId: string, sectionId: string, sectionName: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.SECTION_DELETE,
      target: AuditTargets.SECTION,
      targetId: sectionId,
      meta: { name: sectionName },
      ipAddress,
    }),

  // تسجيل إنشاء وسم
  logTagCreate: (actorId: string, tagId: string, tagName: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.TAG_CREATE,
      target: AuditTargets.TAG,
      targetId: tagId,
      meta: { name: tagName },
      ipAddress,
    }),

  // تسجيل دمج وسوم
  logTagMerge: (actorId: string, sourceTagIds: string[], targetTagId: string, targetTagName: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.TAG_MERGE,
      target: AuditTargets.TAG,
      targetId: targetTagId,
      meta: { targetName: targetTagName, sourceTagIds },
      ipAddress,
    }),

  // تسجيل موافقة على تعليق
  logCommentApprove: (actorId: string, commentId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.COMMENT_APPROVE,
      target: AuditTargets.COMMENT,
      targetId: commentId,
      meta: { postTitle },
      ipAddress,
    }),

  // تسجيل رفض تعليق
  logCommentReject: (actorId: string, commentId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.COMMENT_REJECT,
      target: AuditTargets.COMMENT,
      targetId: commentId,
      meta: { postTitle },
      ipAddress,
    }),

  // تسجيل تمييز تعليق كسبام
  logCommentSpam: (actorId: string, commentId: string, postTitle: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.COMMENT_SPAM,
      target: AuditTargets.COMMENT,
      targetId: commentId,
      meta: { postTitle },
      ipAddress,
    }),

  // تسجيل إنشاء مستخدم
  logUserCreate: (actorId: string, userId: string, userEmail: string, userRole: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.USER_CREATE,
      target: AuditTargets.USER,
      targetId: userId,
      meta: { email: userEmail, role: userRole },
      ipAddress,
    }),

  // تسجيل تغيير دور مستخدم
  logUserRoleChange: (actorId: string, userId: string, userEmail: string, oldRole: string, newRole: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.USER_ROLE_CHANGE,
      target: AuditTargets.USER,
      targetId: userId,
      meta: { email: userEmail, oldRole, newRole },
      ipAddress,
    }),

  // تسجيل تعليق مستخدم
  logUserSuspend: (actorId: string, userId: string, userEmail: string, reason?: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.USER_SUSPEND,
      target: AuditTargets.USER,
      targetId: userId,
      meta: { email: userEmail, reason },
      ipAddress,
    }),

  // تسجيل رفع وسائط
  logMediaUpload: (actorId: string, mediaId: string, filename: string, size: number, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.MEDIA_UPLOAD,
      target: AuditTargets.MEDIA,
      targetId: mediaId,
      meta: { filename, size },
      ipAddress,
    }),

  // تسجيل حذف وسائط
  logMediaDelete: (actorId: string, mediaId: string, filename: string, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.MEDIA_DELETE,
      target: AuditTargets.MEDIA,
      targetId: mediaId,
      meta: { filename },
      ipAddress,
    }),

  // تسجيل إرسال نشرة بريدية
  logNewsletterSend: (actorId: string, campaignId: string, subject: string, recipientCount: number, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.NEWSLETTER_SEND,
      target: AuditTargets.NEWSLETTER,
      targetId: campaignId,
      meta: { subject, recipientCount },
      ipAddress,
    }),

  // تسجيل تحديث إعدادات
  logSettingsUpdate: (actorId: string, settingKey: string, oldValue: any, newValue: any, ipAddress?: string) =>
    logAuditEvent({
      actorId,
      action: AuditActions.SETTINGS_UPDATE,
      target: AuditTargets.SETTINGS,
      targetId: settingKey,
      meta: { key: settingKey, oldValue, newValue },
      ipAddress,
    }),

  // تسجيل تسجيل دخول ناجح
  logLoginSuccess: (userId: string, ipAddress?: string, userAgent?: string) =>
    logAuditEvent({
      actorId: userId,
      action: AuditActions.LOGIN_SUCCESS,
      target: AuditTargets.USER,
      targetId: userId,
      ipAddress,
      userAgent,
    }),

  // تسجيل محاولة دخول فاشلة
  logLoginFailed: (email: string, ipAddress?: string, userAgent?: string) =>
    logAuditEvent({
      action: AuditActions.LOGIN_FAILED,
      target: AuditTargets.USER,
      meta: { email },
      ipAddress,
      userAgent,
    }),
}

// الحصول على سجل التدقيق مع فلترة
export async function getAuditLogs(options: {
  page?: number
  limit?: number
  actorId?: string
  action?: string
  target?: string
  startDate?: Date
  endDate?: Date
}) {
  const {
    page = 1,
    limit = 50,
    actorId,
    action,
    target,
    startDate,
    endDate,
  } = options

  const where: any = {}

  if (actorId) where.actorId = actorId
  if (action) where.action = action
  if (target) where.target = target
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

