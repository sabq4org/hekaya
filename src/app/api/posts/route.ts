import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts - جلب جميع المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (category && category !== 'all') {
      where.category = { name: category }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          section: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب المقالات' },
      { status: 500 }
    )
  }
}

// POST /api/posts - إنشاء مقال جديد
export async function POST(request: NextRequest) {
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
      summary,
      content,
      status,
      coverImage,
      publishedAt,
      sectionId,
      tagIds = []
    } = body

    // التحقق من البيانات المطلوبة
    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من عدم تكرار الـ slug
    if (slug) {
      const existingPost = await prisma.post.findUnique({
        where: { slug }
      })

      if (existingPost) {
        return NextResponse.json(
          { error: 'الرابط المختصر مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // إنشاء المقال
    const post = await prisma.post.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-أ-ي]/g, ''),
        summary,
        content,
        status,
        coverImage,
        publishedAt: status === 'PUBLISHED' ? publishedAt || new Date() : null,
        authorId: session.user.id,
        sectionId
      },
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

    // إضافة الوسوم
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId: string) => ({
          postId: post.id,
          tagId
        })),
        skipDuplicates: true
      })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'خطأ في إنشاء المقال' },
      { status: 500 }
    )
  }
}

