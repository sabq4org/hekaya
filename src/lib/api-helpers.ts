import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { Role } from '@prisma/client'
import { hasPermission, Permission } from './permissions'
import { logAuditEvent } from './audit'

// أنواع الاستجابات
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// إنشاء استجابة نجاح
export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  })
}

// إنشاء استجابة خطأ
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

// أخطاء شائعة
export const ApiErrors = {
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  FORBIDDEN: 'ليس لديك صلاحية لهذا الإجراء',
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  VALIDATION_ERROR: 'خطأ في البيانات المدخلة',
  INTERNAL_ERROR: 'خطأ داخلي في الخادم',
  RATE_LIMIT: 'تم تجاوز الحد المسموح من الطلبات',
  INVALID_METHOD: 'طريقة HTTP غير مدعومة',
  MISSING_FIELDS: 'حقول مطلوبة مفقودة',
  DUPLICATE_ENTRY: 'هذا العنصر موجود بالفعل',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
}

// التحقق من المصادقة
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error(ApiErrors.UNAUTHORIZED)
  }
  
  return session.user
}

// التحقق من الصلاحيات
export async function requirePermission(
  request: NextRequest,
  permission: Permission
) {
  const user = await requireAuth(request)
  
  if (!hasPermission(user.role as Role, permission)) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  return user
}

// التحقق من صلاحيات متعددة
export async function requirePermissions(
  request: NextRequest,
  permissions: Permission[]
) {
  const user = await requireAuth(request)
  
  const hasAllPermissions = permissions.every(permission =>
    hasPermission(user.role as Role, permission)
  )
  
  if (!hasAllPermissions) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  return user
}

// التحقق من أن المستخدم مدير
export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  
  if (user.role !== Role.ADMIN) {
    throw new Error(ApiErrors.FORBIDDEN)
  }
  
  return user
}

// الحصول على معلومات الطلب
export function getRequestInfo(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

// معالج API مع معالجة الأخطاء
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof Error) {
        // أخطاء معروفة
        if (error.message === ApiErrors.UNAUTHORIZED) {
          return errorResponse(ApiErrors.UNAUTHORIZED, 401)
        }
        if (error.message === ApiErrors.FORBIDDEN) {
          return errorResponse(ApiErrors.FORBIDDEN, 403)
        }
        if (error.message === ApiErrors.NOT_FOUND) {
          return errorResponse(ApiErrors.NOT_FOUND, 404)
        }
        if (error.message === ApiErrors.VALIDATION_ERROR) {
          return errorResponse(ApiErrors.VALIDATION_ERROR, 400)
        }
        
        // خطأ عام
        return errorResponse(error.message, 400)
      }
      
      // خطأ غير متوقع
      return errorResponse(ApiErrors.INTERNAL_ERROR, 500)
    }
  }
}

// التحقق من صحة البيانات
export function validateRequired(data: any, fields: string[]) {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`${ApiErrors.MISSING_FIELDS}: ${missing.join(', ')}`)
  }
}

// التحقق من صحة البريد الإلكتروني
export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// التحقق من صحة كلمة المرور
export function validatePassword(password: string) {
  return password.length >= 8
}

// التحقق من صحة الـ slug
export function validateSlug(slug: string) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

// إنشاء slug من النص
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u0600-\u06FF]+/g, '-') // استبدال المسافات والأحرف العربية بشرطة
    .replace(/[^\w\-]+/g, '') // إزالة الأحرف الخاصة
    .replace(/\-\-+/g, '-') // استبدال الشرطات المتعددة بشرطة واحدة
    .replace(/^-+/, '') // إزالة الشرطات من البداية
    .replace(/-+$/, '') // إزالة الشرطات من النهاية
}

// معالجة pagination
export function parsePagination(request: NextRequest) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // حد أقصى 100 عنصر
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  }
}

// معالجة البحث والفلترة
export function parseFilters(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''
  const author = url.searchParams.get('author') || ''
  const section = url.searchParams.get('section') || ''
  const tag = url.searchParams.get('tag') || ''
  const sortBy = url.searchParams.get('sortBy') || 'createdAt'
  const sortOrder = url.searchParams.get('sortOrder') || 'desc'
  
  return {
    search,
    status,
    author,
    section,
    tag,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  }
}

// تسجيل عملية API
export async function logApiAction(
  request: NextRequest,
  action: string,
  target: string,
  targetId?: string,
  meta?: Record<string, any>
) {
  try {
    const session = await getServerSession(authOptions)
    const { ipAddress, userAgent } = getRequestInfo(request)
    
    await logAuditEvent({
      actorId: session?.user?.id,
      action,
      target,
      targetId,
      meta,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error('خطأ في تسجيل العملية:', error)
  }
}

// معالج CRUD عام
export function createCrudHandler<T>(options: {
  model: any // نموذج Prisma
  permissions: {
    create?: Permission
    read?: Permission
    update?: Permission
    delete?: Permission
  }
  validation?: {
    create?: (data: any) => void
    update?: (data: any) => void
  }
  auditTarget: string
}) {
  return {
    // GET - قراءة قائمة
    async list(request: NextRequest) {
      if (options.permissions.read) {
        await requirePermission(request, options.permissions.read)
      }
      
      const { page, limit, skip } = parsePagination(request)
      const filters = parseFilters(request)
      
      // بناء شروط البحث
      const where: any = {}
      
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
        ]
      }
      
      if (filters.status) {
        where.status = filters.status
      }
      
      const [items, total] = await Promise.all([
        options.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [filters.sortBy]: filters.sortOrder },
        }),
        options.model.count({ where }),
      ])
      
      return successResponse(items, undefined, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      })
    },
    
    // GET - قراءة عنصر واحد
    async get(request: NextRequest, { params }: { params: { id: string } }) {
      if (options.permissions.read) {
        await requirePermission(request, options.permissions.read)
      }
      
      const item = await options.model.findUnique({
        where: { id: params.id },
      })
      
      if (!item) {
        throw new Error(ApiErrors.NOT_FOUND)
      }
      
      return successResponse(item)
    },
    
    // POST - إنشاء عنصر جديد
    async create(request: NextRequest) {
      if (options.permissions.create) {
        const user = await requirePermission(request, options.permissions.create)
      }
      
      const data = await request.json()
      
      if (options.validation?.create) {
        options.validation.create(data)
      }
      
      const item = await options.model.create({
        data,
      })
      
      await logApiAction(
        request,
        `${options.auditTarget}_CREATE`,
        options.auditTarget,
        item.id,
        { title: item.title || item.name }
      )
      
      return successResponse(item, 'تم الإنشاء بنجاح')
    },
    
    // PUT - تحديث عنصر
    async update(request: NextRequest, { params }: { params: { id: string } }) {
      if (options.permissions.update) {
        await requirePermission(request, options.permissions.update)
      }
      
      const data = await request.json()
      
      if (options.validation?.update) {
        options.validation.update(data)
      }
      
      const item = await options.model.update({
        where: { id: params.id },
        data,
      })
      
      await logApiAction(
        request,
        `${options.auditTarget}_UPDATE`,
        options.auditTarget,
        item.id,
        { title: item.title || item.name, changes: data }
      )
      
      return successResponse(item, 'تم التحديث بنجاح')
    },
    
    // DELETE - حذف عنصر
    async delete(request: NextRequest, { params }: { params: { id: string } }) {
      if (options.permissions.delete) {
        await requirePermission(request, options.permissions.delete)
      }
      
      const item = await options.model.findUnique({
        where: { id: params.id },
      })
      
      if (!item) {
        throw new Error(ApiErrors.NOT_FOUND)
      }
      
      await options.model.delete({
        where: { id: params.id },
      })
      
      await logApiAction(
        request,
        `${options.auditTarget}_DELETE`,
        options.auditTarget,
        item.id,
        { title: item.title || item.name }
      )
      
      return successResponse(null, 'تم الحذف بنجاح')
    },
  }
}

