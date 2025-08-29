// Mock data for development without database
export const mockSections = [
  {
    id: '1',
    name: 'الذكاء الاصطناعي العام',
    slug: 'ai-general',
    description: 'مقالات عامة في مجال الذكاء الاصطناعي',
    color: '#3B82F6'
  },
  {
    id: '2', 
    name: 'تعلم الآلة',
    slug: 'machine-learning',
    description: 'مقالات متخصصة في تعلم الآلة',
    color: '#10B981'
  },
  {
    id: '3',
    name: 'معالجة اللغة الطبيعية', 
    slug: 'nlp',
    description: 'مقالات في معالجة اللغة الطبيعية',
    color: '#8B5CF6'
  }
]

export const mockTags = [
  { 
    id: '1',
    name: 'تعلم عميق',
    slug: 'deep-learning', 
    description: 'الشبكات العصبية العميقة',
    color: '#EF4444'
  },
  {
    id: '2', 
    name: 'رؤية حاسوبية',
    slug: 'computer-vision',
    description: 'تقنيات الرؤية الحاسوبية',
    color: '#F59E0B'
  },
  {
    id: '3',
    name: 'معالجة الصور',
    slug: 'image-processing', 
    description: 'تقنيات معالجة الصور',
    color: '#06B6D4'
  },
  {
    id: '4',
    name: 'البيانات الضخمة',
    slug: 'big-data',
    description: 'تحليل البيانات الضخمة', 
    color: '#84CC16'
  },
  {
    id: '5',
    name: 'أخلاقيات AI',
    slug: 'ai-ethics',
    description: 'الأخلاقيات في الذكاء الاصطناعي',
    color: '#EC4899'
  }
]

export const mockPosts = [
  {
    id: '1',
    title: 'مقدمة في الذكاء الاصطناعي',
    slug: 'introduction-to-ai',
    summary: 'مقدمة شاملة عن الذكاء الاصطناعي وتطبيقاته المختلفة',
    content: '<p>هذا مقال تجريبي عن الذكاء الاصطناعي...</p>',
    contentText: 'هذا مقال تجريبي عن الذكاء الاصطناعي',
    coverImage: null,
    coverAlt: null,
    status: 'PUBLISHED',
    authorId: '1',
    sectionId: '1',
    tagIds: ['1', '2'],
    views: 150,
    likes: 25,
    shares: 5,
    readingTime: 5,
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    metaTitle: 'مقدمة في الذكاء الاصطناعي',
    metaDescription: 'مقدمة شاملة عن الذكاء الاصطناعي وتطبيقاته المختلفة',
    ogImage: null,
    publishedAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'تعلم الآلة للمبتدئين',
    slug: 'machine-learning-for-beginners',
    summary: 'دليل شامل لتعلم أساسيات تعلم الآلة',
    content: '<p>هذا مقال تجريبي عن تعلم الآلة...</p>',
    contentText: 'هذا مقال تجريبي عن تعلم الآلة',
    coverImage: null,
    coverAlt: null,
    status: 'PUBLISHED',
    authorId: '1',
    sectionId: '2',
    tagIds: ['1', '3'],
    views: 89,
    likes: 12,
    shares: 3,
    readingTime: 7,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    metaTitle: 'تعلم الآلة للمبتدئين',
    metaDescription: 'دليل شامل لتعلم أساسيات تعلم الآلة',
    ogImage: null,
    publishedAt: '2024-01-14T14:30:00.000Z',
    createdAt: '2024-01-14T13:00:00.000Z',
    updatedAt: '2024-01-14T14:30:00.000Z',
  }
]

export const mockUsers = [
  {
    id: '1',
    name: 'مدير الموقع',
    email: 'admin@hekaya-ai.com',
    role: 'ADMIN'
  }
]

// Aliases for easier importing
export const sections = mockSections
export const tags = mockTags
export const posts = mockPosts
export const users = mockUsers
