'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TiptapEditor from '@/components/editor/tiptap-editor'
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft, 
  Image as ImageIcon,
  Calendar,
  Tag,
  User,
  Globe,
  FileText,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { IBM_Plex_Sans_Arabic } from "next/font/google"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState('draft')
  const [publishDate, setPublishDate] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Auto-generate slug from title
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

  const handleSave = (saveStatus: string) => {
    const postData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      status: saveStatus,
      publishDate,
      metaTitle,
      metaDescription
    }
    console.log('Saving post:', postData)
    // TODO: Implement save functionality
  }

  return (
    <div className={`${ibmPlexArabic.className} bg-[#f8f8f7] dark:bg-[#1a1a1a] min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/posts">
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              مقال جديد
            </h1>
            <Sparkles className="w-7 h-7 text-yellow-500 dark:text-yellow-400 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
              style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
              onClick={() => handleSave('draft')}
            >
              <Save className="w-4 h-4" />
              حفظ كمسودة
            </Button>
            <Button 
              variant="outline"
              className="gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600"
              style={{ borderColor: '#f0f0ef', borderRadius: '8px', boxShadow: 'none' }}
            >
              <Eye className="w-4 h-4" />
              معاينة
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              style={{ borderRadius: '8px', boxShadow: 'none' }}
              onClick={() => handleSave('published')}
            >
              <Send className="w-4 h-4" />
              نشر
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Basic Info */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">عنوان المقال</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                  placeholder="أدخل عنوان المقال..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">الرابط الدائم</label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">https://hekaya-ai.com/articles/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    style={{ border: '1px solid #f0f0ef' }}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">المقتطف</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                  placeholder="اكتب وصفاً مختصراً للمقال..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">محتوى المقال</CardTitle>
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
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Globe className="w-5 h-5" />
                إعدادات SEO
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                حسّن ظهور مقالك في محركات البحث
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">عنوان SEO</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                  placeholder={title || 'عنوان المقال في نتائج البحث'}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metaTitle.length || title.length}/60 حرف
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">وصف SEO</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                  placeholder={excerpt || 'وصف المقال في نتائج البحث'}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metaDescription.length || excerpt.length}/160 حرف
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">إعدادات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">الحالة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="scheduled">مجدول</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">تاريخ النشر</label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">الكاتب</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg" style={{ border: '1px solid #f0f0ef' }}>
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm dark:text-gray-300">المدير</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">التصنيفات والوسوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">التصنيف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                >
                  <option value="">اختر تصنيفاً</option>
                  <option value="ai-medicine">الطب والصحة</option>
                  <option value="ai-education">التعليم</option>
                  <option value="ai-technology">التقنية</option>
                  <option value="ai-industry">الصناعة</option>
                  <option value="ai-business">الأعمال</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">الوسوم</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  style={{ border: '1px solid #f0f0ef' }}
                  placeholder="وسوم مفصولة بفاصلة"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">الصورة المميزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" style={{ borderColor: '#f0f0ef' }}>
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">اسحب الصورة هنا أو انقر للاختيار</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG حتى 10MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card 
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            style={{ border: '1px solid #f0f0ef', borderRadius: '12px', boxShadow: 'none' }}
          >
            <CardHeader>
              <CardTitle className="dark:text-gray-100">إحصائيات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">عدد الكلمات</span>
                <span className="text-sm font-bold dark:text-gray-100">
                  {content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">وقت القراءة المتوقع</span>
                <span className="text-sm font-bold dark:text-gray-100">
                  {Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length / 200)} دقائق
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">عدد الأحرف</span>
                <span className="text-sm font-bold dark:text-gray-100">
                  {content.replace(/<[^>]*>/g, '').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}