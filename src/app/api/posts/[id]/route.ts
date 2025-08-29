import { NextRequest, NextResponse } from 'next/server'
import { posts, sections, tags } from '@/lib/mock-data'

// Define types
interface Post {
  id: string
  slug: string
  title: string
  content: string
  sectionId: string
  tagIds?: string[]
  likes?: number
  [key: string]: unknown
}

interface Section {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

interface Tag {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

// GET /api/posts/[id] - الحصول على مقال واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params
    
    // البحث بالـ ID أو الـ slug
    const post = (posts as Post[]).find((p: Post) => p.id === postId || p.slug === postId)
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // Get additional data
    const section = (sections as Section[]).find((s: Section) => s.id === post.sectionId)
    const postTags = (tags as Tag[]).filter((tag: Tag) => 
      post.tagIds?.includes(tag.id)
    )
    
    // تنسيق البيانات
    const formattedPost = {
      ...post,
      author: {
        id: 'admin',
        name: 'مدير الموقع',
        email: 'admin@example.com',
        image: null,
        bio: 'مدير الموقع',
      },
      section: section || null,
      tags: postTags,
      comments: [],
      commentsCount: 0,
      likesCount: post.likes || 0,
    }
    
    return NextResponse.json({
      success: true,
      data: formattedPost
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في جلب المقال' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - تحديث مقال
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params
    const data = await request.json()
    
    // البحث عن المقال في البيانات الوهمية
    const postIndex = (posts as Post[]).findIndex((p: Post) => p.id === postId)
    
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'المقال غير موجود' },
        { status: 404 }
      )
    }
    
    // تحديث البيانات
    const existingPost = posts[postIndex]
    const updatedPost = {
      ...existingPost,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    // If title changed, update slug
    if (data.title && data.title !== (existingPost as Post).title) {
      updatedPost.slug = data.title.toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // Calculate reading time if content changed
    if (data.content) {
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      updatedPost.readingTime = Math.ceil(wordCount / 200)
    }
    
    // Update the post in mock data (in real app this would be database)
    posts[postIndex] = updatedPost
    
    // Get section data
    const section = (sections as Section[]).find((s: Section) => s.id === updatedPost.sectionId)
    
    const response = {
      ...updatedPost,
      author: {
        id: 'admin',
        name: 'مدير الموقع',
        email: 'admin@example.com',
        image: null,
      },
      section: section || null,
    }
    
    return NextResponse.json({
      success: true,
      data: response,
      message: 'تم تحديث المقال بنجاح'
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في تحديث المقال' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - حذف مقال
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params
    
    // البحث عن المقال في البيانات الوهمية
    const postIndex = (posts as Post[]).findIndex((p: Post) => p.id === postId)
    
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'المقال غير موجود' },
        { status: 404 }
      )
    }
    
    // حذف المقال من البيانات الوهمية
    posts.splice(postIndex, 1)
    
    return NextResponse.json({
      success: true,
      data: null,
      message: 'تم حذف المقال بنجاح'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في حذف المقال' },
      { status: 500 }
    )
  }
}

