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

export const mockUsers = [
  {
    id: '1',
    name: 'مدير الموقع',
    email: 'admin@hekaya-ai.com',
    role: 'ADMIN'
  }
]
