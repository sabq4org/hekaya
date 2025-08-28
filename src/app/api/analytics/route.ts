import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  requirePermission,
  validateRequired,
  ApiErrors,
} from '@/lib/api-helpers'
import { Permission } from '@/lib/permissions'

// GET /api/analytics - الحصول على التحليلات العامة
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.VIEW_ANALYTICS)
  const url = new URL(request.url)
  
  // فلاتر التاريخ
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
  
  // حساب نطاق التاريخ
  const dateRange = getDateRange(period, startDate, endDate)
  
  // الحصول على الإحصائيات الأساسية
  const [
    totalPosts,
    publishedPosts,
    totalComments,
    approvedComments,
    totalUsers,
    activeUsers,
    newsletterSubscribers,
    totalViews,
    recentPosts,
    recentComments,
    topPosts,
    topSections,
    topTags,
    userGrowth,
    contentGrowth,
    engagementStats,
  ] = await Promise.all([
    // إجمالي المقالات
    prisma.post.count(),
    
    // المقالات المنشورة
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    
    // إجمالي التعليقات
    prisma.comment.count(),
    
    // التعليقات المعتمدة
    prisma.comment.count({ where: { status: 'APPROVED' } }),
    
    // إجمالي المستخدمين
    prisma.user.count(),
    
    // المستخدمين النشطين
    prisma.user.count({ where: { isActive: true } }),
    
    // مشتركي النشرة البريدية
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    
    // إجمالي المشاهدات
    prisma.post.aggregate({
      _sum: { views: true },
      where: { status: 'PUBLISHED' },
    }),
    
    // المقالات الحديثة (في النطاق الزمني)
    prisma.post.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
    
    // التعليقات الحديثة (في النطاق الزمني)
    prisma.comment.count({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
    
    // أفضل المقالات (بالمشاهدات)
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        likes: true,
        shares: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
          },
        },
      },
      orderBy: { views: 'desc' },
      take: 10,
    }),
    
    // أفضل الأقسام (بعدد المقالات والمشاهدات)
    prisma.section.findMany({
      where: {
        posts: { some: { status: 'PUBLISHED' } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
          },
        },
        posts: {
          where: { status: 'PUBLISHED' },
          select: { views: true },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
      take: 10,
    }),
    
    // أفضل الوسوم (بالاستخدام)
    prisma.tag.findMany({
      where: { usageCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        usageCount: true,
      },
      orderBy: { usageCount: 'desc' },
      take: 10,
    }),
    
    // نمو المستخدمين (آخر 12 شهر)
    getUserGrowthData(),
    
    // نمو المحتوى (آخر 12 شهر)
    getContentGrowthData(),
    
    // إحصائيات التفاعل
    getEngagementStats(dateRange),
  ])
  
  // حساب إجمالي المشاهدات للأقسام
  const sectionsWithViews = topSections.map(section => ({
    ...section,
    totalViews: section.posts.reduce((sum, post) => sum + (post.views || 0), 0),
    posts: undefined, // إزالة تفاصيل المقالات
  }))
  
  const analytics = {
    overview: {
      totalPosts,
      publishedPosts,
      totalComments,
      approvedComments,
      totalUsers,
      activeUsers,
      newsletterSubscribers,
      totalViews: totalViews._sum.views || 0,
    },
    recent: {
      posts: recentPosts,
      comments: recentComments,
    },
    top: {
      posts: topPosts,
      sections: sectionsWithViews,
      tags: topTags,
    },
    growth: {
      users: userGrowth,
      content: contentGrowth,
    },
    engagement: engagementStats,
    period: {
      start: dateRange.start,
      end: dateRange.end,
      label: getPeriodLabel(period),
    },
  }
  
  return successResponse(analytics)
})

// GET /api/analytics/posts - تحليلات المقالات المفصلة
export const GET_POSTS = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.VIEW_ANALYTICS)
  const url = new URL(request.url)
  
  const period = url.searchParams.get('period') || '30d'
  const sectionId = url.searchParams.get('sectionId')
  const authorId = url.searchParams.get('authorId')
  
  const dateRange = getDateRange(period)
  
  // بناء شروط البحث
  const where: any = {
    status: 'PUBLISHED',
    publishedAt: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  }
  
  if (sectionId) {
    where.sectionId = sectionId
  }
  
  if (authorId) {
    where.authorId = authorId
  }
  
  const [
    postsAnalytics,
    viewsOverTime,
    topPerformers,
    engagementMetrics,
  ] = await Promise.all([
    // إحصائيات المقالات
    prisma.post.aggregate({
      where,
      _count: { id: true },
      _sum: { views: true, likes: true, shares: true },
      _avg: { views: true, likes: true, shares: true, readingTime: true },
    }),
    
    // المشاهدات عبر الزمن (يومياً)
    getViewsOverTime(where, dateRange),
    
    // أفضل المقالات أداءً
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        likes: true,
        shares: true,
        readingTime: true,
        publishedAt: true,
        author: {
          select: { id: true, name: true, image: true },
        },
        section: {
          select: { id: true, name: true, color: true },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
          },
        },
      },
      orderBy: { views: 'desc' },
      take: 20,
    }),
    
    // مقاييس التفاعل
    getPostEngagementMetrics(where),
  ])
  
  const analytics = {
    summary: {
      totalPosts: postsAnalytics._count.id,
      totalViews: postsAnalytics._sum.views || 0,
      totalLikes: postsAnalytics._sum.likes || 0,
      totalShares: postsAnalytics._sum.shares || 0,
      avgViews: Math.round(postsAnalytics._avg.views || 0),
      avgLikes: Math.round(postsAnalytics._avg.likes || 0),
      avgShares: Math.round(postsAnalytics._avg.shares || 0),
      avgReadingTime: Math.round(postsAnalytics._avg.readingTime || 0),
    },
    trends: {
      viewsOverTime,
    },
    topPerformers,
    engagement: engagementMetrics,
    period: {
      start: dateRange.start,
      end: dateRange.end,
      label: getPeriodLabel(period),
    },
  }
  
  return successResponse(analytics)
})

// GET /api/analytics/users - تحليلات المستخدمين
export const GET_USERS = withErrorHandling(async (request: NextRequest) => {
  const user = await requirePermission(request, Permission.VIEW_ANALYTICS)
  const url = new URL(request.url)
  
  const period = url.searchParams.get('period') || '30d'
  const dateRange = getDateRange(period)
  
  const [
    userStats,
    usersByRole,
    registrationTrend,
    topAuthors,
    userActivity,
  ] = await Promise.all([
    // إحصائيات المستخدمين
    prisma.user.aggregate({
      _count: { id: true },
    }),
    
    // المستخدمين حسب الدور
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    
    // اتجاه التسجيل
    getRegistrationTrend(dateRange),
    
    // أفضل الكتاب
    prisma.user.findMany({
      where: {
        posts: { some: { status: 'PUBLISHED' } },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } },
            comments: { where: { status: 'APPROVED' } },
          },
        },
        posts: {
          where: { status: 'PUBLISHED' },
          select: { views: true, likes: true },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
      take: 10,
    }),
    
    // نشاط المستخدمين
    getUserActivityStats(dateRange),
  ])
  
  // حساب إحصائيات إضافية للكتاب
  const authorsWithStats = topAuthors.map(author => ({
    ...author,
    totalViews: author.posts.reduce((sum, post) => sum + (post.views || 0), 0),
    totalLikes: author.posts.reduce((sum, post) => sum + (post.likes || 0), 0),
    avgViewsPerPost: author._count.posts > 0 ? 
      Math.round(author.posts.reduce((sum, post) => sum + (post.views || 0), 0) / author._count.posts) : 0,
    posts: undefined, // إزالة تفاصيل المقالات
  }))
  
  const analytics = {
    summary: {
      totalUsers: userStats._count.id,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role
        return acc
      }, {} as Record<string, number>),
    },
    trends: {
      registrationTrend,
    },
    topAuthors: authorsWithStats,
    activity: userActivity,
    period: {
      start: dateRange.start,
      end: dateRange.end,
      label: getPeriodLabel(period),
    },
  }
  
  return successResponse(analytics)
})

// دوال مساعدة

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  const end = endDate ? new Date(endDate) : new Date()
  let start: Date
  
  if (startDate) {
    start = new Date(startDate)
  } else {
    switch (period) {
      case '7d':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
  }
  
  return { start, end }
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '7d': 'آخر 7 أيام',
    '30d': 'آخر 30 يوم',
    '90d': 'آخر 3 أشهر',
    '1y': 'آخر سنة',
  }
  
  return labels[period] || 'فترة مخصصة'
}

async function getUserGrowthData() {
  // نمو المستخدمين شهرياً لآخر 12 شهر
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    })
    
    months.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM
      count,
    })
  }
  
  return months
}

async function getContentGrowthData() {
  // نمو المحتوى شهرياً لآخر 12 شهر
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const [posts, comments] = await Promise.all([
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      }),
      prisma.comment.count({
        where: {
          status: 'APPROVED',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      }),
    ])
    
    months.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM
      posts,
      comments,
    })
  }
  
  return months
}

async function getEngagementStats(dateRange: { start: Date; end: Date }) {
  const [
    avgCommentsPerPost,
    avgLikesPerPost,
    avgSharesPerPost,
    commentRate,
  ] = await Promise.all([
    // متوسط التعليقات لكل مقال
    prisma.post.aggregate({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _avg: {
        comments: true,
      },
    }),
    
    // متوسط الإعجابات لكل مقال
    prisma.post.aggregate({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _avg: {
        likes: true,
      },
    }),
    
    // متوسط المشاركات لكل مقال
    prisma.post.aggregate({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _avg: {
        shares: true,
      },
    }),
    
    // معدل التعليق (التعليقات / المشاهدات)
    getCommentRate(dateRange),
  ])
  
  return {
    avgCommentsPerPost: Math.round(avgCommentsPerPost._avg.comments || 0),
    avgLikesPerPost: Math.round(avgLikesPerPost._avg.likes || 0),
    avgSharesPerPost: Math.round(avgSharesPerPost._avg.shares || 0),
    commentRate: Math.round(commentRate * 100) / 100, // نسبة مئوية
  }
}

async function getViewsOverTime(where: any, dateRange: { start: Date; end: Date }) {
  // هذه دالة مبسطة - في التطبيق الحقيقي يجب تجميع البيانات يومياً
  const days = []
  const dayMs = 24 * 60 * 60 * 1000
  
  for (let d = new Date(dateRange.start); d <= dateRange.end; d.setTime(d.getTime() + dayMs)) {
    const dayStart = new Date(d)
    const dayEnd = new Date(d.getTime() + dayMs)
    
    // في التطبيق الحقيقي، يجب تتبع المشاهدات يومياً
    // هنا نستخدم تقدير بسيط
    days.push({
      date: dayStart.toISOString().slice(0, 10), // YYYY-MM-DD
      views: Math.floor(Math.random() * 1000), // بيانات تجريبية
    })
  }
  
  return days
}

async function getPostEngagementMetrics(where: any) {
  // مقاييس التفاعل للمقالات
  return {
    highEngagement: 0, // مقالات عالية التفاعل
    mediumEngagement: 0, // مقالات متوسطة التفاعل
    lowEngagement: 0, // مقالات منخفضة التفاعل
  }
}

async function getRegistrationTrend(dateRange: { start: Date; end: Date }) {
  // اتجاه التسجيل يومياً
  const days = []
  const dayMs = 24 * 60 * 60 * 1000
  
  for (let d = new Date(dateRange.start); d <= dateRange.end; d.setTime(d.getTime() + dayMs)) {
    const dayStart = new Date(d)
    const dayEnd = new Date(d.getTime() + dayMs)
    
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    })
    
    days.push({
      date: dayStart.toISOString().slice(0, 10), // YYYY-MM-DD
      registrations: count,
    })
  }
  
  return days
}

async function getUserActivityStats(dateRange: { start: Date; end: Date }) {
  // إحصائيات نشاط المستخدمين
  const [
    activeAuthors,
    activeCommenters,
    newUsers,
  ] = await Promise.all([
    // الكتاب النشطين (نشروا مقالات في الفترة)
    prisma.user.count({
      where: {
        posts: {
          some: {
            status: 'PUBLISHED',
            publishedAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        },
      },
    }),
    
    // المعلقين النشطين (علقوا في الفترة)
    prisma.user.count({
      where: {
        comments: {
          some: {
            status: 'APPROVED',
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        },
      },
    }),
    
    // المستخدمين الجدد
    prisma.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
  ])
  
  return {
    activeAuthors,
    activeCommenters,
    newUsers,
  }
}

async function getCommentRate(dateRange: { start: Date; end: Date }) {
  // حساب معدل التعليق (التعليقات / المشاهدات)
  const [totalComments, totalViews] = await Promise.all([
    prisma.comment.count({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
    prisma.post.aggregate({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _sum: { views: true },
    }),
  ])
  
  const views = totalViews._sum.views || 0
  return views > 0 ? totalComments / views : 0
}

