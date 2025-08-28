import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requireAuth,
  requirePermission,
  validateRequired,
  logApiAction,
  ApiErrors,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - الحصول على مستخدم واحد
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requireAuth(request)
  const userId = params.id
  const url = new URL(request.url)
  const includeStats = url.searchParams.get('includeStats') === 'true'
  const includePosts = url.searchParams.get('includePosts') === 'true'
  const includeComments = url.searchParams.get('includeComments') === 'true'
  
  // التحقق من الصلاحيات
  const canViewOthers = currentUser.role === Role.ADMIN || currentUser.role === Role.EDITOR
  const isOwnProfile = currentUser.id === userId
  
  if (!canViewOthers && !isOwnProfile) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  const includeOptions: any = {}
  
  // إضافة الإحصائيات إذا طُلبت
  if (includeStats) {
    includeOptions._count = {
      select: {
        posts: { where: { status: 'PUBLISHED' } },
        comments: { where: { status: 'APPROVED' } },
        auditLogs: true,
      },
    }
  }
  
  // إضافة المقالات إذا طُلبت
  if (includePosts) {
    includeOptions.posts = {
      where: { status: 'PUBLISHED' },
      include: {
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
      orderBy: { publishedAt: 'desc' },
      take: 10,
    }
  }
  
  // إضافة التعليقات إذا طُلبت
  if (includeComments) {
    includeOptions.comments = {
      where: { status: 'APPROVED' },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      bio: true,
      website: true,
      location: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      emailVerifiedAt: true,
      // معلومات حساسة للمستخدم نفسه أو المدراء فقط
      ...(isOwnProfile || canViewOthers ? {
        emailVerified: true,
      } : {}),
      ...includeOptions,
    },
  })
  
  if (!user) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  return successResponse(user)
})

// PUT /api/users/[id] - تحديث مستخدم
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requireAuth(request)
  const data = await request.json()
  const userId = params.id
  
  // البحث عن المستخدم
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!existingUser) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // التحقق من الصلاحيات
  const canEditOthers = currentUser.role === Role.ADMIN || 
                       (currentUser.role === Role.EDITOR && existingUser.role !== Role.ADMIN)
  const isOwnProfile = currentUser.id === userId
  
  if (!canEditOthers && !isOwnProfile) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  // إعداد البيانات للتحديث
  const updateData: any = {}
  
  // البيانات الأساسية (يمكن للمستخدم تعديلها)
  if (data.name) updateData.name = data.name
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.website !== undefined) updateData.website = data.website
  if (data.location !== undefined) updateData.location = data.location
  if (data.image !== undefined) updateData.image = data.image
  
  // البيانات الحساسة (للمدراء والمحررين فقط)
  if (canEditOthers) {
    if (data.email && data.email !== existingUser.email) {
      // التأكد من عدم تكرار البريد الإلكتروني
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
        },
      })
      
      if (emailExists) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل')
      }
      
      updateData.email = data.email
      updateData.emailVerifiedAt = null // إعادة تعيين التحقق
    }
    
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.emailVerified !== undefined) {
      updateData.emailVerifiedAt = data.emailVerified ? new Date() : null
    }
    
    // تغيير الدور (للمدراء فقط أو للمحررين مع قيود)
    if (data.role && data.role !== existingUser.role) {
      // فقط المدير يمكنه ترقية/تنزيل المدراء
      if ((data.role === Role.ADMIN || existingUser.role === Role.ADMIN) && 
          currentUser.role !== Role.ADMIN) {
        throw new Error('فقط المدير يمكنه تعديل دور المدراء')
      }
      
      // منع المستخدم من تغيير دوره الشخصي
      if (isOwnProfile && !canEditOthers) {
        throw new Error('لا يمكن تغيير دورك الشخصي')
      }
      
      updateData.role = data.role
    }
  }
  
  // تغيير كلمة المرور
  if (data.password) {
    // التحقق من كلمة المرور الحالية للمستخدم نفسه
    if (isOwnProfile && !canEditOthers) {
      if (!data.currentPassword) {
        throw new Error('يجب إدخال كلمة المرور الحالية')
      }
      
      const isValidPassword = await bcrypt.compare(data.currentPassword, existingUser.password)
      if (!isValidPassword) {
        throw new Error('كلمة المرور الحالية غير صحيحة')
      }
    }
    
    updateData.password = await bcrypt.hash(data.password, 12)
  }
  
  // تحديث المستخدم
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      bio: true,
      website: true,
      location: true,
      createdAt: true,
      updatedAt: true,
      emailVerifiedAt: true,
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'USER_UPDATE',
    'USER',
    updatedUser.id,
    { 
      changes: Object.keys(updateData),
      targetUser: updatedUser.name,
      isOwnProfile,
    }
  )
  
  return successResponse(updatedUser, 'تم تحديث المستخدم بنجاح')
})

// DELETE /api/users/[id] - حذف مستخدم
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requirePermission(request, Permission.DELETE_USER)
  const userId = params.id
  
  // منع المستخدم من حذف نفسه
  if (currentUser.id === userId) {
    throw new Error('لا يمكن حذف حسابك الشخصي')
  }
  
  // البحث عن المستخدم
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  })
  
  if (!user) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  // منع حذف المدراء (إلا من مدير آخر)
  if (user.role === Role.ADMIN && currentUser.role !== Role.ADMIN) {
    throw new Error('لا يمكن حذف المدراء')
  }
  
  // التحقق من وجود محتوى
  if (user._count.posts > 0 || user._count.comments > 0) {
    throw new Error(`لا يمكن حذف المستخدم لأنه يملك ${user._count.posts} مقال و ${user._count.comments} تعليق`)
  }
  
  // حذف المستخدم
  await prisma.user.delete({
    where: { id: userId },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'USER_DELETE',
    'USER',
    userId,
    { 
      name: user.name,
      email: user.email,
      role: user.role,
    }
  )
  
  return successResponse(null, 'تم حذف المستخدم بنجاح')
})

// PATCH /api/users/[id] - عمليات خاصة على المستخدم
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requireAuth(request)
  const { action, data } = await request.json()
  const userId = params.id
  
  validateRequired({ action }, ['action'])
  
  // البحث عن المستخدم
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!user) {
    throw new Error(ApiErrors.NOT_FOUND)
  }
  
  let result
  
  switch (action) {
    case 'activate':
      // التحقق من الصلاحيات
      if (currentUser.role !== Role.ADMIN && 
          !(currentUser.role === Role.EDITOR && user.role !== Role.ADMIN)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      })
      
      await logApiAction(
        request,
        'USER_ACTIVATE',
        'USER',
        userId,
        { targetUser: user.name }
      )
      
      break
      
    case 'deactivate':
      // التحقق من الصلاحيات
      if (currentUser.role !== Role.ADMIN && 
          !(currentUser.role === Role.EDITOR && user.role !== Role.ADMIN)) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      // منع إلغاء تفعيل النفس
      if (currentUser.id === userId) {
        throw new Error('لا يمكن إلغاء تفعيل حسابك الشخصي')
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      })
      
      await logApiAction(
        request,
        'USER_DEACTIVATE',
        'USER',
        userId,
        { targetUser: user.name }
      )
      
      break
      
    case 'verifyEmail':
      // التحقق من الصلاحيات
      if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date() },
      })
      
      await logApiAction(
        request,
        'USER_VERIFY_EMAIL',
        'USER',
        userId,
        { targetUser: user.name }
      )
      
      break
      
    case 'resetPassword':
      // التحقق من الصلاحيات
      if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.EDITOR) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      // إنشاء كلمة مرور مؤقتة
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12)
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedTempPassword },
      })
      
      // في التطبيق الحقيقي، يجب إرسال كلمة المرور الجديدة بالبريد الإلكتروني
      result = { ...result, tempPassword } // للاختبار فقط
      
      await logApiAction(
        request,
        'USER_RESET_PASSWORD',
        'USER',
        userId,
        { targetUser: user.name }
      )
      
      break
      
    case 'promoteToEditor':
      // فقط المدير يمكنه الترقية
      if (currentUser.role !== Role.ADMIN) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      if (user.role === Role.ADMIN) {
        throw new Error('المدير لا يحتاج ترقية')
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { role: Role.EDITOR },
      })
      
      await logApiAction(
        request,
        'USER_PROMOTE_TO_EDITOR',
        'USER',
        userId,
        { targetUser: user.name, oldRole: user.role }
      )
      
      break
      
    case 'promoteToAdmin':
      // فقط المدير يمكنه ترقية مدراء
      if (currentUser.role !== Role.ADMIN) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      if (user.role === Role.ADMIN) {
        throw new Error('المستخدم مدير بالفعل')
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { role: Role.ADMIN },
      })
      
      await logApiAction(
        request,
        'USER_PROMOTE_TO_ADMIN',
        'USER',
        userId,
        { targetUser: user.name, oldRole: user.role }
      )
      
      break
      
    case 'demoteToAuthor':
      // فقط المدير يمكنه التنزيل
      if (currentUser.role !== Role.ADMIN) {
        throw new Error(ApiErrors.FORBIDDEN)
      }
      
      // منع تنزيل النفس
      if (currentUser.id === userId) {
        throw new Error('لا يمكن تنزيل دورك الشخصي')
      }
      
      if (user.role === Role.AUTHOR || user.role === Role.READER) {
        throw new Error('المستخدم ليس في دور عالي')
      }
      
      result = await prisma.user.update({
        where: { id: userId },
        data: { role: Role.AUTHOR },
      })
      
      await logApiAction(
        request,
        'USER_DEMOTE_TO_AUTHOR',
        'USER',
        userId,
        { targetUser: user.name, oldRole: user.role }
      )
      
      break
      
    case 'updateLastLogin':
      // تحديث آخر تسجيل دخول (للنظام فقط)
      result = await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      })
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, 'تم تنفيذ العملية بنجاح')
})

