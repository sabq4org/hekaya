import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-helpers'

// Simplified validation function for development
function validateRequired(data: any, fields: string[]) {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`الحقول المطلوبة مفقودة: ${missing.join(', ')}`)
  }
}

// Simple slug creation
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u0600-\u06FF]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// GET /api/posts - الحصول على قائمة المقالات
export async function GET(request: NextRequest) {
  try {
    // مقالات وهمية للتطوير
    const mockPosts = [
      {
        id: '1',
        title: 'مقال تجريبي في الذكاء الاصطناعي',
        slug: 'test-ai-article',
        summary: 'هذا مقال تجريبي للاختبار',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      }
    ]
    
    return successResponse(mockPosts)
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'خطأ في جلب المقالات' 
    }, { status: 500 })
  }
}

// POST /api/posts - إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // التحقق من البيانات المطلوبة
    validateRequired(data, ['title', 'content'])
    
    // إنشاء slug تلقائياً إذا لم يكن موجوداً
    if (!data.slug) {
      data.slug = createSlug(data.title)
    }
    
    // حساب وقت القراءة التقريبي
    if (data.contentText) {
      const wordsPerMinute = 200
      const wordCount = data.contentText.split(/\s+/).length
      data.readingTime = Math.ceil(wordCount / wordsPerMinute)
    }
    
    // محاكاة إنشاء المقال
    const newPost = {
      id: Date.now().toString(),
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      contentText: data.contentText,
      status: data.status || 'DRAFT',
      coverImage: data.coverImage,
      readingTime: data.readingTime || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'PUBLISHED' ? new Date().toISOString() : null,
      author: {
        id: '1',
        name: 'مدير الموقع',
        email: 'admin@hekaya-ai.com',
      }
    }
    
    return successResponse(newPost, 'تم إنشاء المقال بنجاح')
  } catch (error: any) {
    console.error('API Error:', error)
    return Response.json({ 
      success: false, 
      error: error.message || 'حدث خطأ أثناء إنشاء المقال' 
    }, { status: 400 })
  }
}

