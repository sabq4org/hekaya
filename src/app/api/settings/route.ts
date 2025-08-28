import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  logApiAction,
} from '@/lib/api-helpers'
import { SettingType } from '@prisma/client'

// GET /api/settings - الحصول على جميع الإعدادات
export const GET = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.VIEW_SETTING)
  const url = new URL(request.url)
  
  // فلاتر
  const category = url.searchParams.get('category')
  const type = url.searchParams.get('type') as SettingType | null
  const isPublic = url.searchParams.get('isPublic')
  const grouped = url.searchParams.get('grouped') === 'true'
  
  // بناء شروط البحث
  const where: Record<string, unknown> = {}
  
  if (category) {
    where.category = category
  }
  
  if (type) {
    where.type = type
  }
  
  if (isPublic !== null) {
    where.isPublic = isPublic === 'true'
  }
  
  const settings = await prisma.setting.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { order: 'asc' },
      { key: 'asc' },
    ],
  })
  
  // تجميع الإعدادات حسب الفئة إذا طُلب
  if (grouped) {
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, typeof settings>)
    
    return successResponse(groupedSettings)
  }
  
  return successResponse(settings)
})

// POST /api/settings - إنشاء إعداد جديد
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_SETTING)
  const data = await request.json()
  
  // التحقق من البيانات المطلوبة
  validateRequired(data, ['key', 'value', 'type', 'category'])
  
  // التأكد من عدم وجود المفتاح
  const existingSetting = await prisma.setting.findUnique({
    where: { key: data.key },
  })
  
  if (existingSetting) {
    throw new Error('مفتاح الإعداد موجود بالفعل')
  }
  
  // تحديد الترتيب التلقائي
  if (!data.order) {
    const lastSetting = await prisma.setting.findFirst({
      where: { category: data.category },
      orderBy: { order: 'desc' },
    })
    
    data.order = (lastSetting?.order || 0) + 1
  }
  
  // إنشاء الإعداد
  const setting = await prisma.setting.create({
    data: {
      key: data.key,
      value: data.value,
      type: data.type,
      category: data.category,
      description: data.description,
      isPublic: data.isPublic !== false,
      order: data.order,
      validation: data.validation,
      options: data.options,
    },
  })
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SETTING_CREATE',
    'SETTING',
    setting.id,
    { 
      key: setting.key,
      category: setting.category,
      type: setting.type,
    }
  )
  
  return successResponse(setting, 'تم إنشاء الإعداد بنجاح')
})

// PUT /api/settings/bulk - تحديث إعدادات متعددة
export const PUT = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_SETTING)
  const { settings } = await request.json()
  
  validateRequired({ settings }, ['settings'])
  
  if (!Array.isArray(settings) || settings.length === 0) {
    throw new Error('يجب تحديد إعدادات للتحديث')
  }
  
  const updatePromises = []
  const updatedSettings = []
  
  for (const settingData of settings) {
    validateRequired(settingData, ['key', 'value'])
    
    // التحقق من وجود الإعداد
    const existingSetting = await prisma.setting.findUnique({
      where: { key: settingData.key },
    })
    
    if (!existingSetting) {
      throw new Error(`الإعداد ${settingData.key} غير موجود`)
    }
    
    // تحديث الإعداد
    const updatePromise = prisma.setting.update({
      where: { key: settingData.key },
      data: {
        value: settingData.value,
        description: settingData.description !== undefined ? 
                    settingData.description : existingSetting.description,
        isPublic: settingData.isPublic !== undefined ? 
                 settingData.isPublic : existingSetting.isPublic,
        order: settingData.order !== undefined ? 
               settingData.order : existingSetting.order,
        validation: settingData.validation !== undefined ? 
                   settingData.validation : existingSetting.validation,
        options: settingData.options !== undefined ? 
                settingData.options : existingSetting.options,
        updatedAt: new Date(),
      },
    })
    
    updatePromises.push(updatePromise)
    updatedSettings.push({
      key: settingData.key,
      oldValue: existingSetting.value,
      newValue: settingData.value,
    })
  }
  
  // تنفيذ جميع التحديثات
  const results = await Promise.all(updatePromises)
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SETTINGS_BULK_UPDATE',
    'SETTING',
    undefined,
    { 
      updatedSettings,
      count: results.length,
    }
  )
  
  return successResponse(results, `تم تحديث ${results.length} إعداد`)
})

// PATCH /api/settings/reset - إعادة تعيين الإعدادات للقيم الافتراضية
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  await await requirePermission(request, Permission.MANAGE_SETTING)
  const { category, keys } = await request.json()
  
  let where: Record<string, unknown> = {}
  
  if (category) {
    where.category = category
  }
  
  if (keys && Array.isArray(keys)) {
    where.key = { in: keys }
  }
  
  // الحصول على الإعدادات المراد إعادة تعيينها
  const settingsToReset = await prisma.setting.findMany({ where })
  
  if (settingsToReset.length === 0) {
    throw new Error('لا توجد إعدادات للإعادة تعيين')
  }
  
  // قيم افتراضية للإعدادات الأساسية
  const defaultValues: Record<string, string> = {
    'site.name': 'حكاية AI',
    'site.description': 'منصة ذكية للمحتوى العربي',
    'site.url': 'https://hekaya-ai.com',
    'site.logo': '',
    'site.favicon': '',
    'site.language': 'ar',
    'site.timezone': 'Asia/Riyadh',
    'posts.per_page': '10',
    'posts.allow_comments': 'true',
    'posts.auto_publish': 'false',
    'comments.moderation': 'true',
    'comments.auto_approve': 'false',
    'comments.max_depth': '2',
    'newsletter.enabled': 'true',
    'newsletter.from_name': 'حكاية AI',
    'newsletter.from_email': 'newsletter@hekaya-ai.com',
    'seo.meta_title': 'حكاية AI - منصة ذكية للمحتوى العربي',
    'seo.meta_description': 'اكتشف أحدث المقالات والمحتوى الذكي في حكاية AI',
    'seo.og_image': '',
  }
  
  // تحديث الإعدادات بالقيم الافتراضية
  const updatePromises = settingsToReset.map(setting => {
    const defaultValue = defaultValues[setting.key] || setting.value
    
    return prisma.setting.update({
      where: { id: setting.id },
      data: {
        value: defaultValue,
        updatedAt: new Date(),
      },
    })
  })
  
  const results = await Promise.all(updatePromises)
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SETTINGS_RESET',
    'SETTING',
    undefined,
    { 
      category,
      keys,
      count: results.length,
    }
  )
  
  return successResponse(results, `تم إعادة تعيين ${results.length} إعداد`)
})

// GET /api/settings/categories - الحصول على فئات الإعدادات
export const GET_CATEGORIES = withErrorHandling(async (request: NextRequest) => {
  await requirePermission(request, Permission.VIEW_SETTING)
  
  const categories = await prisma.setting.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { category: 'asc' },
  })
  
  const categoriesWithInfo = categories.map(cat => ({
    name: cat.category,
    count: cat._count.category,
    // إضافة معلومات إضافية عن الفئات
    displayName: getCategoryDisplayName(cat.category),
    description: getCategoryDescription(cat.category),
    icon: getCategoryIcon(cat.category),
  }))
  
  return successResponse(categoriesWithInfo)
})

// دوال مساعدة لمعلومات الفئات
function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    'site': 'إعدادات الموقع',
    'posts': 'إعدادات المقالات',
    'comments': 'إعدادات التعليقات',
    'newsletter': 'إعدادات النشرة البريدية',
    'seo': 'إعدادات SEO',
    'social': 'إعدادات وسائل التواصل',
    'analytics': 'إعدادات التحليلات',
    'security': 'إعدادات الأمان',
    'performance': 'إعدادات الأداء',
    'integrations': 'إعدادات التكاملات',
  }
  
  return displayNames[category] || category
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'site': 'الإعدادات الأساسية للموقع مثل الاسم والوصف والشعار',
    'posts': 'إعدادات عرض وإدارة المقالات',
    'comments': 'إعدادات نظام التعليقات والمراجعة',
    'newsletter': 'إعدادات النشرة البريدية والحملات',
    'seo': 'إعدادات تحسين محركات البحث',
    'social': 'إعدادات وسائل التواصل الاجتماعي',
    'analytics': 'إعدادات التحليلات والإحصائيات',
    'security': 'إعدادات الأمان والحماية',
    'performance': 'إعدادات الأداء والتحسين',
    'integrations': 'إعدادات التكامل مع الخدمات الخارجية',
  }
  
  return descriptions[category] || 'إعدادات متنوعة'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'site': 'globe',
    'posts': 'file-text',
    'comments': 'message-circle',
    'newsletter': 'mail',
    'seo': 'search',
    'social': 'share-2',
    'analytics': 'bar-chart',
    'security': 'shield',
    'performance': 'zap',
    'integrations': 'plug',
  }
  
  return icons[category] || 'settings'
}

