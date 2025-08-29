import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-helpers'
import { mockTags } from '@/lib/mock-data'

// GET /api/tags - الحصول على قائمة الوسوم
export async function GET(request: NextRequest) {
  try {
    return successResponse(mockTags)
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'خطأ في جلب الوسوم' 
    }, { status: 500 })
  }
}

