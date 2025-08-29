import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-helpers'
import { mockSections } from '@/lib/mock-data'

// GET /api/sections - الحصول على قائمة الأقسام
export async function GET(request: NextRequest) {
  try {
    return successResponse(mockSections)
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'خطأ في جلب الأقسام' 
    }, { status: 500 })
  }
}