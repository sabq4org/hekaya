import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة البيانات الأولية...')

  // إنشاء المستخدمين الأساسيين
  const adminPassword = await bcrypt.hash('admin123', 12)
  const editorPassword = await bcrypt.hash('editor123', 12)
  const authorPassword = await bcrypt.hash('author123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hekaya-ai.com' },
    update: {},
    create: {
      email: 'admin@hekaya-ai.com',
      name: 'مدير الموقع',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'مدير موقع حكاية AI ومسؤول عن الإشراف العام على المحتوى والمستخدمين.',
    },
  })

  const editor = await prisma.user.upsert({
    where: { email: 'editor@hekaya-ai.com' },
    update: {},
    create: {
      email: 'editor@hekaya-ai.com',
      name: 'محرر المحتوى',
      password: editorPassword,
      role: 'EDITOR',
      bio: 'محرر محتوى متخصص في مراجعة وتحسين المقالات التقنية.',
    },
  })

  const author = await prisma.user.upsert({
    where: { email: 'author@hekaya-ai.com' },
    update: {},
    create: {
      email: 'author@hekaya-ai.com',
      name: 'كاتب المقالات',
      password: authorPassword,
      role: 'AUTHOR',
      bio: 'كاتب متخصص في مجال الذكاء الاصطناعي وتعلم الآلة.',
    },
  })

  console.log('✅ تم إنشاء المستخدمين الأساسيين')

  // إنشاء الأقسام الرئيسية
  const aiSection = await prisma.section.upsert({
    where: { slug: 'artificial-intelligence' },
    update: {},
    create: {
      name: 'الذكاء الاصطناعي',
      slug: 'artificial-intelligence',
      description: 'مقالات شاملة حول الذكاء الاصطناعي وتطبيقاته المختلفة',
      order: 1,
    },
  })

  const mlSection = await prisma.section.upsert({
    where: { slug: 'machine-learning' },
    update: {},
    create: {
      name: 'تعلم الآلة',
      slug: 'machine-learning',
      description: 'دروس ومقالات متخصصة في تعلم الآلة والخوارزميات',
      order: 2,
    },
  })

  const techSection = await prisma.section.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'التقنية',
      slug: 'technology',
      description: 'آخر الأخبار والتطورات في عالم التقنية',
      order: 3,
    },
  })

  console.log('✅ تم إنشاء الأقسام الرئيسية')

  // إنشاء الوسوم
  const tags = [
    { name: 'الذكاء الاصطناعي', slug: 'ai', color: '#3B82F6' },
    { name: 'تعلم الآلة', slug: 'machine-learning', color: '#10B981' },
    { name: 'التعلم العميق', slug: 'deep-learning', color: '#8B5CF6' },
    { name: 'معالجة اللغة الطبيعية', slug: 'nlp', color: '#F59E0B' },
    { name: 'الرؤية الحاسوبية', slug: 'computer-vision', color: '#EF4444' },
    { name: 'الروبوتات', slug: 'robotics', color: '#06B6D4' },
    { name: 'البيانات الضخمة', slug: 'big-data', color: '#84CC16' },
    { name: 'إنترنت الأشياء', slug: 'iot', color: '#F97316' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }

  console.log('✅ تم إنشاء الوسوم')

  // إنشاء مقال تجريبي
  const samplePost = await prisma.post.upsert({
    where: { slug: 'future-of-ai-in-education' },
    update: {},
    create: {
      title: 'مستقبل الذكاء الاصطناعي في التعليم',
      slug: 'future-of-ai-in-education',
      summary: 'استكشاف كيف سيغير الذكاء الاصطناعي مجال التعليم في السنوات القادمة',
      content: `# مستقبل الذكاء الاصطناعي في التعليم

## مقدمة

يشهد مجال التعليم تطوراً مستمراً مع دخول تقنيات الذكاء الاصطناعي، حيث تفتح هذه التقنيات آفاقاً جديدة لتحسين جودة التعليم وتخصيص التجربة التعليمية لكل طالب.

## التطبيقات الحالية

### 1. التعلم التكيفي
- أنظمة تتكيف مع سرعة تعلم كل طالب
- محتوى مخصص حسب نقاط القوة والضعف
- مسارات تعليمية فردية

### 2. المساعدون الافتراضيون
- الإجابة على استفسارات الطلاب على مدار الساعة
- توجيه الطلاب للموارد المناسبة
- دعم المعلمين في المهام الإدارية

### 3. تحليل الأداء
- تتبع تقدم الطلاب في الوقت الفعلي
- تحديد الطلاب المعرضين لخطر التسرب
- توصيات لتحسين الأداء

## التحديات والفرص

### التحديات:
- الخصوصية وأمان البيانات
- الحاجة لتدريب المعلمين
- التكلفة والبنية التحتية

### الفرص:
- تعليم أكثر شمولية وإتاحة
- تحسين نتائج التعلم
- تقليل الأعباء على المعلمين

## الخلاصة

الذكاء الاصطناعي ليس مجرد أداة تقنية، بل شريك في رحلة التعلم يساعد على خلق بيئة تعليمية أكثر فعالية وتخصيصاً.`,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingTime: 5,
      views: 1250,
      authorId: author.id,
      sectionId: aiSection.id,
    },
  })

  // ربط المقال بالوسوم
  await prisma.postTag.createMany({
    data: [
      { postId: samplePost.id, tagId: (await prisma.tag.findUnique({ where: { slug: 'ai' } }))!.id },
      { postId: samplePost.id, tagId: (await prisma.tag.findUnique({ where: { slug: 'machine-learning' } }))!.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ تم إنشاء المقال التجريبي')

  // إنشاء إعدادات الموقع
  const settings = [
    { key: 'site_name', value: 'حكاية AI', type: 'string' },
    { key: 'site_description', value: 'منصة عربية متخصصة في الذكاء الاصطناعي وتعلم الآلة', type: 'string' },
    { key: 'posts_per_page', value: '10', type: 'number' },
    { key: 'allow_comments', value: 'true', type: 'boolean' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ تم إنشاء إعدادات الموقع')

  console.log('🎉 تم إنهاء إضافة البيانات الأولية بنجاح!')
  console.log(`
📊 ملخص البيانات المضافة:
- 👥 المستخدمون: 3 (مدير، محرر، كاتب)
- 📂 الأقسام: 3 أقسام رئيسية
- 🏷️ الوسوم: 8 وسوم متنوعة
- 📝 المقالات: 1 مقال تجريبي
- ⚙️ الإعدادات: 5 إعدادات أساسية

🔐 بيانات تسجيل الدخول:
- المدير: admin@hekaya-ai.com / admin123
- المحرر: editor@hekaya-ai.com / editor123
- الكاتب: author@hekaya-ai.com / author123
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

