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
  FileText
} from 'lucide-react'
import Link from 'next/link'

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
      tags: tags.split(',').map(tag => tag.trim()),
      featuredImage,
      status: saveStatus,
      publishDate,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
    }
    
    console.log('Saving post:', postData)
    // هنا سيتم إرسال البيانات إلى API
    alert(`تم ${saveStatus === 'published' ? 'نشر' : 'حفظ'} المقال بنجاح!`)
  }

  const handlePreview = () => {
    // فتح معاينة في نافذة جديدة
    window.open('/admin/posts/preview', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للمقالات
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مقال جديد</h1>
            <p className="text-gray-600 mt-1">إنشاء مقال جديد ونشره على الموقع</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            حفظ كمسودة
          </Button>
          <Button onClick={() => handleSave('published')}>
            <Send className="h-4 w-4 mr-2" />
            نشر المقال
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                معلومات المقال الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل عنوان المقال..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرابط المختصر (Slug)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="article-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  سيظهر في الرابط: /articles/{slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الملخص
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملخص قصير عن المقال..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>محتوى المقال</CardTitle>
              <CardDescription>
                استخدم المحرر المتقدم لكتابة وتنسيق محتوى المقال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="ابدأ كتابة محتوى المقال هنا..."
                className="min-h-[500px]"
              />
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                إعدادات SEO
              </CardTitle>
              <CardDescription>
                تحسين المقال لمحركات البحث
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان SEO
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان محسن لمحركات البحث..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {metaTitle.length}/60 حرف (الموصى به: 50-60 حرف)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف SEO
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف محسن لمحركات البحث..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {metaDescription.length}/160 حرف (الموصى به: 150-160 حرف)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                إعدادات النشر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة المقال
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="scheduled">مجدول</option>
                </select>
              </div>

              {status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ النشر
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكاتب
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>د. سارة الأحمد</option>
                  <option>أحمد محمد</option>
                  <option>محمد علي</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                التصنيف والوسوم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">اختر التصنيف</option>
                  <option value="ai">الذكاء الاصطناعي</option>
                  <option value="medicine">الطب والتقنية</option>
                  <option value="education">التعليم</option>
                  <option value="business">الأعمال</option>
                  <option value="ethics">الأخلاقيات</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوسوم
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وسم1، وسم2، وسم3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  افصل الوسوم بفاصلة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                الصورة المميزة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="رابط الصورة المميزة"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
              </div>
              
              {featuredImage && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <img
                    src={featuredImage}
                    alt="معاينة الصورة المميزة"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <Button variant="outline" className="w-full">
                <ImageIcon className="h-4 w-4 mr-2" />
                رفع صورة
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>عدد الكلمات:</span>
                <span>{content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>عدد الأحرف:</span>
                <span>{content.replace(/<[^>]*>/g, '').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>وقت القراءة المقدر:</span>
                <span>{Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200)} دقيقة</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

