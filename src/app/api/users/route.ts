import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  parseFilters,
  logApiAction,
} from '@/lib/api-helpers'
import bcrypt from 'bcryptjs'

// GET /api/users - الحصول على قائمة المستخدمين
export const GET = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.VIEW_USER)
  const { page, limit, skip } = parsePagination(request)
  const filters = parseFilters(request)
  const url = new URL(request.url)
  
  // فلاتر إضافية
  const role = url.searchParams.get('role') as Role | null
  const isActive = url.searchParams.get('isActive')
  const includeStats = url.searchParams.get('includeStats') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  // البحث النصي
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { bio: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  
  // فلترة بالدور
  if (role) {
    where.role = role
  }
  
  // فلترة بالحالة النشطة
  if (isActive !== null) {
    where.isActive = isActive === 'true'
  }
  
  const includeOptions: Record<string, unknown> = {}
  
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
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
        ...includeOptions,
      },
      orderBy: { [filters.sortBy]: filters.sortOrder },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])
  
  return successResponse(users, undefined, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/users - إنشاء مستخدم جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  const currentUser = await requirePermission(request, Permission.CREATE_USER)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['name', 'email', 'password', 'role'])
  
  // التأكد من عدم وجود المستخدم
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })
  
  if (existingUser) {
    throw new Error('البريد الإلكتروني مستخدم بالفعل')
  }
  
  // التحقق من صلاحية إنشاء الدور المطلوب
  if (data.role === Role.ADMIN && currentUser.role !== Role.ADMIN) {
    throw new Error('فقط المدير يمكنه إنشاء مدير آخر')
  }
  
  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  // إنشاء المستخدم
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      bio: data.bio,
      website: data.website,
      location: data.location,
      image: data.image,
      isActive: data.isActive !== false,
      emailVerifiedAt: data.emailVerified ? new Date() : null,
    },
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
      emailVerifiedAt: true,
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'USER_CREATE',
    'USER',
    user.id,
    { 
      name: user.name,
      email: user.email,
      role: user.role,
    }
  )
  
  return successResponse(user, 'تم إنشاء المستخدم بنجاح')
})

// PATCH /api/users/bulk - عمليات جماعية على المستخدمين
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const currentUser = await requirePermission(request, Permission.UPDATE_USER)
  const { action, userIds, data } = await request.json()
  
  validateRequired({ action, userIds }, ['action', 'userIds'])
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('يجب تحديد مستخدمين للتعديل')
  }
  
  // التأكد من عدم تضمين المستخدم الحالي في العمليات الخطيرة
  if (['deactivate', 'delete', 'changeRole'].includes(action) && 
      userIds.includes(currentUser.id)) {
    throw new Error('لا يمكن تطبيق هذه العملية على حسابك الشخصي')
  }
  
  let result
  
  switch (action) {
    case 'activate':
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: true },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_ACTIVATE',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      break
      
    case 'deactivate':
      result = await prisma.user.updateMany({
        where: { 
          id: { in: userIds },
          // منع إلغاء تفعيل المدراء
          role: { not: Role.ADMIN },
        },
        data: { isActive: false },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_DEACTIVATE',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      break
      
    case 'changeRole':
      validateRequired(data, ['role'])
      
      // التحقق من صلاحية تغيير الدور
      if (data.role === Role.ADMIN && currentUser.role !== Role.ADMIN) {
        throw new Error('فقط المدير يمكنه ترقية مستخدمين لمدراء')
      }
      
      // منع تغيير دور المدراء الآخرين
      if (currentUser.role !== Role.ADMIN) {
        const adminUsers = await prisma.user.findMany({
          where: { 
            id: { in: userIds },
            role: Role.ADMIN,
          },
          select: { id: true },
        })
        
        if (adminUsers.length > 0) {
          throw new Error('لا يمكن تغيير دور المدراء')
        }
      }
      
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { role: data.role },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_CHANGE_ROLE',
        'USER',
        undefined,
        { userIds, newRole: data.role, count: result.count }
      )
      
      break
      
    case 'verifyEmail':
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { emailVerifiedAt: new Date() },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_VERIFY_EMAIL',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      break
      
    case 'unverifyEmail':
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { emailVerifiedAt: null },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_UNVERIFY_EMAIL',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      break
      
    case 'resetPassword':
      // إنشاء كلمة مرور مؤقتة
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12)
      
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { 
          password: hashedTempPassword,
          // يمكن إضافة حقل لإجبار تغيير كلمة المرور في أول تسجيل دخول
        },
      })
      
      // في التطبيق الحقيقي، يجب إرسال كلمة المرور الجديدة بالبريد الإلكتروني
      
      await logApiAction(
        request,
        'USERS_BULK_RESET_PASSWORD',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      result = { ...result, tempPassword } // للاختبار فقط
      
      break
      
    case 'delete':
      // التحقق من صلاحية الحذف
      await requirePermission(request, Permission.DELETE_USER)
      
      // التحقق من عدم وجود محتوى للمستخدمين
      const usersWithContent = await prisma.user.findMany({
        where: { 
          id: { in: userIds },
          OR: [
            { posts: { some: {} } },
            { comments: { some: {} } },
          ],
        },
        select: { id: true, name: true, email: true },
      })
      
      if (usersWithContent.length > 0) {
        const userNames = usersWithContent.map(u => u.name).join(', ')
        throw new Error(`لا يمكن حذف المستخدمين الذين لديهم محتوى: ${userNames}`)
      }
      
      result = await prisma.user.deleteMany({
        where: { 
          id: { in: userIds },
          role: { not: Role.ADMIN }, // حماية إضافية
        },
      })
      
      await logApiAction(
        request,
        'USERS_BULK_DELETE',
        'USER',
        undefined,
        { userIds, count: result.count }
      )
      
      break
      
    default:
      throw new Error('عملية غير مدعومة')
  }
  
  return successResponse(result, `تم تنفيذ العملية على ${result.count} مستخدم`)
})

// GET /api/users/stats - إحصائيات المستخدمين
export const GET_STATS = withErrorHandling(async (request: NextRequest) => {
  await requirePermission(request, Permission.VIEW_USER)
  
  const [
    totalUsers,
    activeUsers,
    usersByRole,
    recentUsers,
    topAuthors,
  ] = await Promise.all([
    // إجمالي المستخدمين
    prisma.user.count(),
    
    // المستخدمين النشطين
    prisma.user.count({ where: { isActive: true } }),
    
    // المستخدمين حسب الدور
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    
    // المستخدمين الجدد (آخر 30 يوم)
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // أفضل الكتاب (بعدد المقالات المنشورة)
    prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.EDITOR, Role.AUTHOR] },
        posts: { some: { status: 'PUBLISHED' } },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
          },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
      take: 10,
    }),
  ])
  
  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    recentUsers,
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role
      return acc
    }, {} as Record<string, number>),
    topAuthors,
  }
  
  return successResponse(stats)
})

