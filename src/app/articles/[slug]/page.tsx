
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export const dynamic = 'force-dynamic'

async function getPost(slug: string) {
  try {
    const hdrs = headers()
    const host = hdrs.get('host') || 'localhost:3000'
    const proto = hdrs.get('x-forwarded-proto') || 'http'
    const base = `${proto}://${host}`
    const res = await fetch(`${base}/api/posts/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json: ApiResponse = await res.json()
    if (!json.success || !json.data) return null
    return json.data
  } catch {
    return null
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return notFound()

  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null
  const contentHtml = typeof post.content === 'object' && post.content?.html ? post.content.html : null

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-[#1a1a1a]">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/blog" className="hover:underline">
              العودة إلى المدونة
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-gray-100">{post.title}</h1>
          {post.summary && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{post.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-700 py-3 mb-8">
            {post.author?.name && <span>بقلم {post.author.name}</span>}
            {publishedAt && <span>{publishedAt.toLocaleDateString('ar-SA')}</span>}
            {typeof post.readingTime === 'number' && <span>{post.readingTime} دقائق قراءة</span>}
            {post.section?.name && <span>في {post.section.name}</span>}
          </div>

          {post.coverImage && (
            <div className="mb-8">
              <img src={post.coverImage} alt={post.coverAlt || post.title} className="w-full h-auto rounded-lg" />
            </div>
          )}

          <article className="prose prose-lg max-w-none dark:prose-invert">
            {contentHtml ? (
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <p>{post.contentText}</p>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}


