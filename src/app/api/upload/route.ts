import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن يكون الملف صورة' },
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

    // رفع الصورة إلى Vercel Blob
    const { url, pathname } = await put(`images/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

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
      { success: false, error: 'حدث خطأ أثناء رفع الصورة' },
      { status: 500 }
    )
  }
}
