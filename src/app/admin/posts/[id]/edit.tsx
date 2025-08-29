'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TiptapEditor from '@/components/editor/tiptap-editor'
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft, 
  User,
  Globe,
  Sparkles,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { IBM_Plex_Sans_Arabic } from "next/font/google"
import ImageUploader from '@/components/ui/image-uploader'

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

interface Post {
  id: string
  title: string
  slug: string
  summary?: string
  content: string
  status: string
  coverImage?: string
  metaTitle?: string
  metaDescription?: string
  sectionId?: string
  tagIds?: string[]
  scheduledFor?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function EditPost() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState('draft')
  const [publishDate, setPublishDate] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sections, setSections] = useState<{id: string, name: string}[]>([])
  const [allTags, setAllTags] = useState<{id: string, name: string}[]>([])
  const [loadingOpts, setLoadingOpts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load post data
  useEffect(() => {
    if (!postId) {
      setError('معرف المقال مفقود')
      setLoading(false)
      return
    }

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`)
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'فشل في تحميل المقال')
        }

        const postData = result.data
        setPost(postData)
        
        // Fill form with existing data
        setTitle(postData.title || '')
        setSlug(postData.slug || '')
        setExcerpt(postData.summary || '')
        setContent(postData.content?.html || postData.content || '')
        setCategory(postData.sectionId || '')
        setTags(postData.tagIds || [])
        setFeaturedImage(postData.coverImage || '')
        setStatus(postData.status?.toLowerCase() || 'draft')
        setMetaTitle(postData.metaTitle || '')
        setMetaDescription(postData.metaDescription || '')
        
        if (postData.scheduledFor) {
          const date = new Date(postData.scheduledFor)
          setPublishDate(date.toISOString().slice(0, 16))
        }

      } catch (err) {
        console.error('Error loading post:', err)
        setError((err as Error).message || 'حدث خطأ أثناء تحميل المقال')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [postId])

  // Load options (sections and tags)
  useEffect(() => {
    let canceled = false
    async function loadOptions() {
      try {
        setLoadingOpts(true)
        const [secRes, tagRes] = await Promise.all([
          fetch('/api/sections?includeStats=false&limit=100'),
          fetch('/api/tags?limit=100&popular=true')
        ])
        const secJson = await secRes.json()
        const tagJson = await tagRes.json()
        if (!canceled) {
          setSections(Array.isArray(secJson.data) ? secJson.data : [])
          setAllTags(Array.isArray(tagJson.data) ? tagJson.data : [])
        }
      } catch {
        if (!canceled) {
          setSections([])
          setAllTags([])
        }
      } finally {
        if (!canceled) setLoadingOpts(false)
      }
    }
    loadOptions()
    return () => { canceled = true }
  }, [])

  // Auto-generate slug from title (only if slug is empty)
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setSlug(generatedSlug)
    }
  }

  const handleSave = async (saveStatus: string) => {
    if (isSaving || !post) return
    setIsSaving(true)
    try {
      const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      const statusMap: Record<string, string> = {
        draft: 'DRAFT',
        published: 'PUBLISHED',
        scheduled: 'SCHEDULED',
      }

      const payload: Record<string, unknown> = {
        title,
        slug: slug || undefined,
        summary: excerpt || undefined,
        content: { html: content },
        contentText: plainText,
        status: statusMap[saveStatus] || 'DRAFT',
        coverImage: featuredImage || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        sectionId: category || undefined,
        tagIds: tags.length ? tags : undefined,
      }

      if (payload.status === 'SCHEDULED' && publishDate) {
        payload.scheduledFor = publishDate
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'تعذر حفظ المقال')
      }

      const updatedPost = json.data
      if (payload.status === 'PUBLISHED') {
        router.push(`/articles/${updatedPost.slug}`)
      } else {
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error(error)
      alert((error as Error).message || 'حدث خطأ غير متوقع أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المقال...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل المقال</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'المقال غير موجود أو تم حذفه'}
            </p>
            <Link href="/admin/posts">
              <Button variant="outline">العودة إلى قائمة المقالات</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  العودة
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                تحرير المقال
              </h1>
              <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ كمسودة'}
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                معاينة
              </Button>
              <Button 
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => handleSave('published')}
                disabled={isSaving}
              >
                <Send className="w-4 h-4" />
                {isSaving ? 'جاري النشر...' : 'نشر التحديث'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان المقال</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="أدخل عنوان المقال..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الرابط الدائم</label>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">https://hekaya-ai.com/articles/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المقتطف</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="اكتب وصفاً مختصراً للمقال..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>محتوى المقال</CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor 
                  content={content}
                  onChange={setContent}
                  placeholder="ابدأ بكتابة محتوى المقال..."
                  className="min-h-[500px]"
                />
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  إعدادات SEO
                </CardTitle>
                <CardDescription>حسّن ظهور مقالك في محركات البحث</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان SEO</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={title || 'عنوان المقال في نتائج البحث'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">وصف SEO</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={excerpt || 'وصف المقال في نتائج البحث'}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>إعدادات النشر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحالة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="scheduled">مجدول</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ النشر</label>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الكاتب</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">المدير</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>التصنيفات والوسوم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loadingOpts}
                  >
                    <option value="">{loadingOpts ? 'جارِ التحميل...' : 'اختر تصنيفاً'}</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوسوم</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((t) => {
                      const active = tags.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setTags((prev) => active ? prev.filter(id => id !== t.id) : [...prev, t.id])
                          }}
                          className={`px-3 py-1 text-sm rounded-full border ${
                            active 
                              ? 'bg-purple-600 text-white border-purple-600' 
                              : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300'
                          }`}
                        >
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>الصورة المميزة</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImageUploaded={(url) => setFeaturedImage(url)}
                  maxSizeMB={5}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
