'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  Calendar, 
  Clock, 
  User, 
  Sparkles
} from "lucide-react"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let canceled = false
    async function load() {
      try {
        const res = await fetch('/api/posts?published=true&limit=12')
        const json = await res.json()
        if (!canceled && json?.success) {
          setArticles(Array.isArray(json.data) ? json.data : [])
          setTotal(json?.pagination?.total || (Array.isArray(json.data) ? json.data.length : 0))
        }
      } catch (e) {
        if (!canceled) {
          setArticles([])
          setTotal(0)
        }
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    load()
    return () => { canceled = true }
  }, [])

  return (
    <div className={`min-h-screen ${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a]`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                مكتبة المقالات
              </span>
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500 dark:text-yellow-400" />
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              اكتشف عالم الذكاء الاصطناعي من خلال مقالاتنا المتخصصة
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading && (
              <div className="text-center text-gray-500 dark:text-gray-400">جارِ التحميل...</div>
            )}
            {!loading && articles.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">لا توجد مقالات منشورة بعد.</div>
            )}
            {!loading && articles.map((article: any) => (
              <Link href={`/articles/${article.slug}`} key={article.id}>
                <Card 
                  className="group transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full bg-white dark:bg-gray-800 dark:border-gray-700"
                  style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-3 text-purple-600 dark:text-purple-400 shrink-0 bg-gray-100 dark:bg-gray-700" style={{ borderRadius: '8px' }} />
                        <div className="flex-1">
                          {article.section?.name && (
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">{article.section.name}</div>
                          )}
                          <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 dark:text-gray-100">
                            {article.title}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-3 text-base leading-relaxed">
                      {article.summary || article.contentText?.slice(0, 140)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0 px-6 pb-6">
                    {/* Publication Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 dark:border-gray-700" style={{ borderTop: '1px solid #f0f0ef', paddingTop: '12px' }}>
                      {article.author?.name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author.name}</span>
                        </div>
                      )}
                      {article.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      {typeof article.readingTime === 'number' && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readingTime} دقائق</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More Section */}
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">عرض {articles.length} من {total} مقال</p>
            <button 
              className="px-6 py-3 transition-colors bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700"
              style={{ 
                border: '1px solid #f0f0ef',
                borderRadius: '8px'
              }}
            >
              عرض المزيد
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}