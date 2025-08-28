'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  FileText,
  TrendingUp,
  Hash
} from 'lucide-react'

// Mock data - في التطبيق الحقيقي سيتم جلبها من API
const mockCategories = [
  {
    id: '1',
    name: 'الذكاء الاصطناعي',
    slug: 'artificial-intelligence',
    description: 'مقالات حول تطبيقات وتطورات الذكاء الاصطناعي',
    color: '#3b82f6',
    postsCount: 15,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'الطب والتقنية',
    slug: 'medical-technology',
    description: 'التقنيات الحديثة في المجال الطبي والصحي',
    color: '#10b981',
    postsCount: 8,
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'التعليم والتقنية',
    slug: 'education-technology',
    description: 'تطبيقات التقنية في مجال التعليم والتدريب',
    color: '#f59e0b',
    postsCount: 12,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'الأعمال والتقنية',
    slug: 'business-technology',
    description: 'التقنيات المؤثرة في عالم الأعمال والشركات',
    color: '#8b5cf6',
    postsCount: 6,
    createdAt: '2024-02-10'
  },
  {
    id: '5',
    name: 'الأخلاقيات',
    slug: 'ethics',
    description: 'القضايا الأخلاقية المتعلقة بالتقنية والذكاء الاصطناعي',
    color: '#ef4444',
    postsCount: 4,
    createdAt: '2024-02-15'
  }
]

const mockTags = [
  { id: '1', name: 'تعلم الآلة', slug: 'machine-learning', postsCount: 12 },
  { id: '2', name: 'الشبكات العصبية', slug: 'neural-networks', postsCount: 8 },
  { id: '3', name: 'معالجة اللغة الطبيعية', slug: 'nlp', postsCount: 6 },
  { id: '4', name: 'رؤية الحاسوب', slug: 'computer-vision', postsCount: 5 },
  { id: '5', name: 'التشخيص الطبي', slug: 'medical-diagnosis', postsCount: 4 },
  { id: '6', name: 'التعليم الإلكتروني', slug: 'e-learning', postsCount: 7 },
  { id: '7', name: 'الأتمتة', slug: 'automation', postsCount: 9 },
  { id: '8', name: 'البيانات الضخمة', slug: 'big-data', postsCount: 6 }
]

export default function CategoriesManagement() {
  const [categories, setCategories] = useState(mockCategories)
  const [tags, setTags] = useState(mockTags)
  const [activeTab, setActiveTab] = useState('categories')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6'
  })

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      color: formData.color,
      postsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setCategories([...categories, newCategory])
    resetForm()
  }

  const handleAddTag = () => {
    const newTag = {
      id: Date.now().toString(),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      postsCount: 0
    }
    setTags([...tags, newTag])
    resetForm()
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      color: item.color || '#3b82f6'
    })
    setShowAddForm(true)
  }

  const handleUpdate = () => {
    if (activeTab === 'categories') {
      setCategories(categories.map(cat => 
        cat.id === editingItem.id 
          ? { ...cat, ...formData }
          : cat
      ))
    } else {
      setTags(tags.map(tag => 
        tag.id === editingItem.id 
          ? { ...tag, name: formData.name, slug: formData.slug }
          : tag
      ))
    }
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      if (activeTab === 'categories') {
        setCategories(categories.filter(cat => cat.id !== id))
      } else {
        setTags(tags.filter(tag => tag.id !== id))
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', color: '#3b82f6' })
    setShowAddForm(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التصنيفات والوسوم</h1>
          <p className="text-gray-600 mt-1">إدارة تصنيفات ووسوم المقالات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التصنيفات</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">+1 هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوسوم</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">+3 هذا الأسبوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقالات المصنفة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.postsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">من إجمالي المقالات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأكثر استخداماً</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.sort((a, b) => b.postsCount - a.postsCount)[0]?.name.slice(0, 10)}...
            </div>
            <p className="text-xs text-muted-foreground">
              {categories.sort((a, b) => b.postsCount - a.postsCount)[0]?.postsCount} مقال
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            التصنيفات ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            الوسوم ({tags.length})
          </button>
        </nav>
      </div>

      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={`البحث في ${activeTab === 'categories' ? 'التصنيفات' : 'الوسوم'}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'categories' ? 'تصنيف جديد' : 'وسم جديد'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'categories' ? 'تصنيف' : 'وسم'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرابط المختصر
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  dir="ltr"
                />
              </div>
              {activeTab === 'categories' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوصف
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اللون
                    </label>
                    <input
                      type="color"
                      className="w-full h-10 border border-gray-300 rounded-lg"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={editingItem ? handleUpdate : (activeTab === 'categories' ? handleAddCategory : handleAddTag)}>
                {editingItem ? 'تحديث' : 'إضافة'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{category.postsCount} مقال</span>
                  <span>/{category.slug}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tags List */}
      {activeTab === 'tags' && (
        <Card>
          <CardHeader>
            <CardTitle>الوسوم ({filteredTags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-900">الاسم</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">الرابط المختصر</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">عدد المقالات</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map((tag) => (
                    <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          #{tag.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        /{tag.slug}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {tag.postsCount}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tag)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tag.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

