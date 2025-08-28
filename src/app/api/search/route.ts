import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withErrorHandling,
  successResponse,
  parsePagination,
  logApiAction,
} from '@/lib/api-helpers'

// GET /api/search - البحث الشامل
export const GET = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  const type = url.searchParams.get('type') // posts, users, comments, sections, tags, all
  const { page, limit, skip } = parsePagination(request)
  
  // فلاتر إضافية
  const sectionId = url.searchParams.get('sectionId')
  const tagId = url.searchParams.get('tagId')
  const authorId = url.searchParams.get('authorId')
  const status = url.searchParams.get('status')
  const dateFrom = url.searchParams.get('dateFrom')
  const dateTo = url.searchParams.get('dateTo')
  const sortBy = url.searchParams.get('sortBy') || 'relevance' // relevance, date, views, likes
  const includeContent = url.searchParams.get('includeContent') === 'true'
  
  if (!query || query.trim().length < 2) {
    throw new Error('يجب أن يكون البحث أكثر من حرفين')
  }
  
  const searchQuery = query.trim()
  const searchTypes = type ? [type] : ['posts', 'users', 'sections', 'tags']
  
  const results: Record<string, unknown> = {}
  let totalResults = 0
  
  // البحث في المقالات
  if (searchTypes.includes('posts') || searchTypes.includes('all')) {
    const postsWhere = buildPostsSearchWhere(searchQuery, {
      sectionId,
      tagId,
      authorId,
      status: status || 'PUBLISHED',
      dateFrom,
      dateTo,
    })
    
    const [posts, postsCount] = await Promise.all([
      prisma.post.findMany({
        where: postsWhere,
        include: {
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
              slug: true,
              color: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          _count: {
            select: {
              comments: { where: { status: 'APPROVED' } },
            },
          },
        },
        orderBy: getPostsOrderBy(sortBy),
        skip: type === 'posts' ? skip : 0,
        take: type === 'posts' ? limit : 5,
      }),
      prisma.post.count({ where: postsWhere }),
    ])
    
    // إضافة نقاط الصلة للمقالات
    const postsWithRelevance = posts.map(post => ({
      ...post,
      relevanceScore: calculatePostRelevance(post, searchQuery),
      excerpt: includeContent ? 
        extractExcerpt(post.content, searchQuery) : 
        post.excerpt,
      content: includeContent ? post.content : undefined,
    }))
    
    results.posts = {
      items: postsWithRelevance,
      total: postsCount,
      hasMore: postsCount > (type === 'posts' ? skip + limit : 5),
    }
    
    totalResults += postsCount
  }
  
  // البحث في المستخدمين
  if (searchTypes.includes('users') || searchTypes.includes('all')) {
    const usersWhere = buildUsersSearchWhere(searchQuery)
    
    const [users, usersCount] = await Promise.all([
      prisma.user.findMany({
        where: usersWhere,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          bio: true,
          website: true,
          location: true,
          isActive: true,
          _count: {
            select: {
              posts: { where: { status: 'PUBLISHED' } },
              comments: { where: { status: 'APPROVED' } },
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: type === 'users' ? skip : 0,
        take: type === 'users' ? limit : 5,
      }),
      prisma.user.count({ where: usersWhere }),
    ])
    
    results.users = {
      items: users,
      total: usersCount,
      hasMore: usersCount > (type === 'users' ? skip + limit : 5),
    }
    
    totalResults += usersCount
  }
  
  // البحث في الأقسام
  if (searchTypes.includes('sections') || searchTypes.includes('all')) {
    const sectionsWhere = buildSectionsSearchWhere(searchQuery)
    
    const [sections, sectionsCount] = await Promise.all([
      prisma.section.findMany({
        where: sectionsWhere,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              posts: { where: { status: 'PUBLISHED' } },
              children: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: type === 'sections' ? skip : 0,
        take: type === 'sections' ? limit : 5,
      }),
      prisma.section.count({ where: sectionsWhere }),
    ])
    
    results.sections = {
      items: sections,
      total: sectionsCount,
      hasMore: sectionsCount > (type === 'sections' ? skip + limit : 5),
    }
    
    totalResults += sectionsCount
  }
  
  // البحث في الوسوم
  if (searchTypes.includes('tags') || searchTypes.includes('all')) {
    const tagsWhere = buildTagsSearchWhere(searchQuery)
    
    const [tags, tagsCount] = await Promise.all([
      prisma.tag.findMany({
        where: tagsWhere,
        orderBy: { usageCount: 'desc' },
        skip: type === 'tags' ? skip : 0,
        take: type === 'tags' ? limit : 10,
      }),
      prisma.tag.count({ where: tagsWhere }),
    ])
    
    results.tags = {
      items: tags,
      total: tagsCount,
      hasMore: tagsCount > (type === 'tags' ? skip + limit : 10),
    }
    
    totalResults += tagsCount
  }
  
  // البحث في التعليقات (للمدراء والمحررين فقط)
  if ((searchTypes.includes('comments') || searchTypes.includes('all'))) {
    try {
      await await requireAuth(request)
      if (user.role === Role.ADMIN || user.role === Role.EDITOR) {
        const commentsWhere = buildCommentsSearchWhere(searchQuery)
        
        const [comments, commentsCount] = await Promise.all([
          prisma.comment.findMany({
            where: commentsWhere,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              post: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: type === 'comments' ? skip : 0,
            take: type === 'comments' ? limit : 3,
          }),
          prisma.comment.count({ where: commentsWhere }),
        ])
        
        results.comments = {
          items: comments,
          total: commentsCount,
          hasMore: commentsCount > (type === 'comments' ? skip + limit : 3),
        }
        
        totalResults += commentsCount
      }
    } catch (error) {
      // المستخدم غير مسجل دخول أو ليس لديه صلاحية
    }
  }
  
  // اقتراحات البحث
  const suggestions = await getSearchSuggestions(searchQuery)
  
  // تسجيل البحث للإحصائيات
  await logSearchQuery(request, searchQuery, type, totalResults)
  
  return successResponse({
    query: searchQuery,
    type: type || 'all',
    results,
    totalResults,
    suggestions,
    pagination: type && type !== 'all' ? {
      page,
      limit,
      total: results[type]?.total || 0,
      pages: Math.ceil((results[type]?.total || 0) / limit),
    } : undefined,
  })
})

// POST /api/search/index - إعادة فهرسة المحتوى
export const POST = withErrorHandling(async (request: NextRequest) => {
  await await requireAuth(request)
  
  // فقط المدراء يمكنهم إعادة الفهرسة
  if (user.role !== Role.ADMIN) {
    throw new Error('غير مسموح')
  }
  
  const { type } = await request.json()
  
  let indexedCount = 0
  
  switch (type) {
    case 'posts':
      indexedCount = await indexPosts()
      break
    case 'users':
      indexedCount = await indexUsers()
      break
    case 'all':
      const [postsCount, usersCount] = await Promise.all([
        indexPosts(),
        indexUsers(),
      ])
      indexedCount = postsCount + usersCount
      break
    default:
      throw new Error('نوع الفهرسة غير مدعوم')
  }
  
  // تسجيل العملية
  await logApiAction(
    request,
    'SEARCH_REINDEX',
    'SEARCH',
    undefined,
    { type, indexedCount }
  )
  
  return successResponse({ indexedCount }, `تم فهرسة ${indexedCount} عنصر`)
})

// GET /api/search/suggestions - اقتراحات البحث
export const GET_SUGGESTIONS = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  
  if (!query || query.trim().length < 2) {
    return successResponse([])
  }
  
  const suggestions = await getSearchSuggestions(query.trim(), limit)
  
  return successResponse(suggestions)
})

// GET /api/search/popular - البحثات الشائعة
export const GET_POPULAR = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d
  
  // حساب نطاق التاريخ
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  // الحصول على البحثات الشائعة من سجل التدقيق
  const popularSearches = await prisma.auditLog.groupBy({
    by: ['metadata'],
    where: {
      action: 'SEARCH_QUERY',
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      metadata: true,
    },
    orderBy: {
      _count: {
        metadata: 'desc',
      },
    },
    take: limit,
  })
  
  // استخراج الاستعلامات من metadata
  const searches = popularSearches
    .map(item => {
      try {
        const metadata = typeof item.metadata === 'string' ? 
          JSON.parse(item.metadata) : item.metadata
        return {
          query: metadata.query,
          count: item._count.metadata,
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)
  
  return successResponse(searches)
})

// دوال مساعدة

function buildPostsSearchWhere(query: string, filters: Record<string, unknown>) {
  const where: Record<string, unknown> = {
    AND: [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
          { section: { name: { contains: query, mode: 'insensitive' } } },
          { author: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
    ],
  }
  
  if (filters.status) {
    where.AND.push({ status: filters.status })
  }
  
  if (filters.sectionId) {
    where.AND.push({ sectionId: filters.sectionId })
  }
  
  if (filters.tagId) {
    where.AND.push({ tags: { some: { id: filters.tagId } } })
  }
  
  if (filters.authorId) {
    where.AND.push({ authorId: filters.authorId })
  }
  
  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, unknown> = {}
    if (filters.dateFrom) dateFilter.gte = new Date(filters.dateFrom)
    if (filters.dateTo) dateFilter.lte = new Date(filters.dateTo)
    where.AND.push({ publishedAt: dateFilter })
  }
  
  return where
}

function buildUsersSearchWhere(query: string) {
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
      { location: { contains: query, mode: 'insensitive' } },
    ],
    isActive: true,
  }
}

function buildSectionsSearchWhere(query: string) {
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
    isActive: true,
  }
}

function buildTagsSearchWhere(query: string) {
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  }
}

function buildCommentsSearchWhere(query: string) {
  return {
    content: { contains: query, mode: 'insensitive' },
    status: 'APPROVED',
  }
}

function getPostsOrderBy(sortBy: string) {
  switch (sortBy) {
    case 'date':
      return { publishedAt: 'desc' }
    case 'views':
      return { views: 'desc' }
    case 'likes':
      return { likes: 'desc' }
    case 'comments':
      return { comments: 'desc' }
    case 'relevance':
    default:
      return { publishedAt: 'desc' } // في التطبيق الحقيقي، يجب حساب الصلة
  }
}

function calculatePostRelevance(post: Record<string, unknown>, query: string): number {
  let score = 0
  const queryLower = query.toLowerCase()
  
  // نقاط للعنوان
  if (post.title.toLowerCase().includes(queryLower)) {
    score += 10
  }
  
  // نقاط للملخص
  if (post.excerpt?.toLowerCase().includes(queryLower)) {
    score += 5
  }
  
  // نقاط للمحتوى
  if (post.content.toLowerCase().includes(queryLower)) {
    score += 3
  }
  
  // نقاط للوسوم
  if (post.tags?.some((tag: Record<string, unknown>) => tag.name.toLowerCase().includes(queryLower))) {
    score += 7
  }
  
  // نقاط للقسم
  if (post.section?.name.toLowerCase().includes(queryLower)) {
    score += 6
  }
  
  // نقاط للكاتب
  if (post.author?.name.toLowerCase().includes(queryLower)) {
    score += 4
  }
  
  // نقاط إضافية للشعبية
  score += Math.log(post.views + 1) * 0.1
  score += Math.log(post.likes + 1) * 0.2
  
  return Math.round(score * 100) / 100
}

function extractExcerpt(content: string, query: string, length: number = 200): string {
  const queryLower = query.toLowerCase()
  const contentLower = content.toLowerCase()
  
  // البحث عن أول ظهور للكلمة المفتاحية
  const index = contentLower.indexOf(queryLower)
  
  if (index === -1) {
    // إذا لم توجد الكلمة، أرجع بداية المحتوى
    return content.substring(0, length) + (content.length > length ? '...' : '')
  }
  
  // حساب نقطة البداية والنهاية
  const start = Math.max(0, index - length / 2)
  const end = Math.min(content.length, start + length)
  
  let excerpt = content.substring(start, end)
  
  // إضافة نقاط في البداية والنهاية إذا لزم الأمر
  if (start > 0) excerpt = '...' + excerpt
  if (end < content.length) excerpt = excerpt + '...'
  
  return excerpt
}

async function getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
  const suggestions: string[] = []
  
  // اقتراحات من عناوين المقالات
  const posts = await prisma.post.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
      status: 'PUBLISHED',
    },
    select: { title: true },
    take: limit / 2,
  })
  
  suggestions.push(...posts.map(p => p.title))
  
  // اقتراحات من أسماء الوسوم
  const tags = await prisma.tag.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' },
    },
    select: { name: true },
    orderBy: { usageCount: 'desc' },
    take: limit / 2,
  })
  
  suggestions.push(...tags.map(t => t.name))
  
  // إزالة التكرارات وإرجاع العدد المطلوب
  return [...new Set(suggestions)].slice(0, limit)
}

async function indexPosts(): Promise<number> {
  // في التطبيق الحقيقي، هنا يتم إنشاء فهرس البحث
  // مثل Elasticsearch أو فهرس نصي مخصص
  
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true },
  })
  
  // محاكاة عملية الفهرسة
  return posts.length
}

async function indexUsers(): Promise<number> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  })
  
  return users.length
}

async function logSearchQuery(request: NextRequest, query: string, type: string | null, results: number) {
  try {
    await logApiAction(
      request,
      'SEARCH_QUERY',
      'SEARCH',
      undefined,
      { 
        query,
        type: type || 'all',
        results,
        timestamp: new Date().toISOString(),
      }
    )
  } catch (error) {
    // تجاهل أخطاء التسجيل
  }
}

