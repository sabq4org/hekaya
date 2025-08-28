import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts/[id] - جلب مقال واحد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, bio: true }
        },
        category: true,
        tags: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // زيادة عدد المشاهدات
    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب المقال' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - تحديث مقال
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      status,
      categoryId,
      tagIds = [],
      featuredImage,
      metaTitle,
      metaDescription,
      publishedAt
    } = body

    // التحقق من وجود المقال
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لتعديل هذا المقال' },
        { status: 403 }
      )
    }

    // التحقق من عدم تكرار الـ slug (إذا تم تغييره)
    if (slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // تحديث المقال
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt,
        content,
        status,
        featuredImage,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        publishedAt: status === 'published' && !existingPost.publishedAt 
          ? publishedAt || new Date() 
          : existingPost.publishedAt,
        categoryId,
        tags: {
          set: [], // إزالة جميع الوسوم الحالية
          connect: tagIds.map((id: string) => ({ id })) // إضافة الوسوم الجديدة
        }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        tags: true
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'خطأ في تحديث المقال' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - حذف مقال
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // التحقق من وجود المقال
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من الصلاحيات
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لحذف هذا المقال' },
        { status: 403 }
      )
    }

    // حذف المقال
    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المقال بنجاح' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'خطأ في حذف المقال' },
      { status: 500 }
    )
  }
}

