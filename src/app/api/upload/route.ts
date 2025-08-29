import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // التحقق من وجود TOKEN
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN غير موجود في متغيرات البيئة')
      return NextResponse.json(
        { success: false, error: 'إعدادات الرفع غير صحيحة' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يُسمح بـ: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // التحقق من حجم الملف (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الصورة يجب أن يكون أقل من 10MB' },
        { status: 400 }
      )
    }

    console.log(`رفع صورة: ${file.name}, الحجم: ${file.size} bytes, النوع: ${file.type}`)

    // إنشاء اسم فريد للملف
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // رفع الصورة إلى Vercel Blob
    const { url, pathname } = await put(`images/${fileName}`, file, {
      access: 'public',
      addRandomSuffix: false, // لأننا أضفنا timestamp بالفعل
    })

    console.log(`تم رفع الصورة بنجاح: ${url}`)

    return NextResponse.json({
      success: true,
      data: {
        url,
        pathname,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
      message: 'تم رفع الصورة بنجاح'
    })

  } catch (error) {
    console.error('خطأ في رفع الصورة:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء رفع الصورة: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
