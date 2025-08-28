import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts/[id] - جلب مقال واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, bio: true }
        },
        section: true,
        tags: {
          include: {
            tag: true
          }
        },
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      summary,
      content,
      status,
      sectionId,
      tagIds = [],
      coverImage,
      publishedAt
    } = body

    // التحقق من وجود المقال
    const existingPost = await prisma.post.findUnique({
      where: { id }
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
    await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        status,
        coverImage,
        publishedAt: status === 'PUBLISHED' && !existingPost.publishedAt 
          ? publishedAt || new Date() 
          : existingPost.publishedAt,
        sectionId
      }
    })

    // إزالة الوسوم الحالية
    await prisma.postTag.deleteMany({
      where: { postId: id }
    })

    // إضافة الوسوم الجديدة
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId: string) => ({
          postId: id,
          tagId
        })),
        skipDuplicates: true
      })
    }

    // جلب المقال المحدث مع العلاقات
    const finalPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        section: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(finalPost)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // التحقق من وجود المقال
    const existingPost = await prisma.post.findUnique({
      where: { id }
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
      where: { id }
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

