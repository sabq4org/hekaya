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
      status: 'ACTIVE',
      bio: 'مدير موقع حكاية AI ومسؤول عن الإشراف العام على المحتوى والمستخدمين.',
      emailVerified: new Date(),
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
      status: 'ACTIVE',
      bio: 'محرر محتوى متخصص في مراجعة وتحسين المقالات التقنية.',
      emailVerified: new Date(),
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
      status: 'ACTIVE',
      bio: 'كاتب متخصص في مجال الذكاء الاصطناعي وتعلم الآلة.',
      emailVerified: new Date(),
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
      color: '#3B82F6',
      order: 1,
      views: 2500,
    },
  })

  const mlSection = await prisma.section.upsert({
    where: { slug: 'machine-learning' },
    update: {},
    create: {
      name: 'تعلم الآلة',
      slug: 'machine-learning',
      description: 'دروس ومقالات متخصصة في تعلم الآلة والخوارزميات',
      color: '#10B981',
      parentId: aiSection.id,
      order: 1,
      views: 1800,
    },
  })

  const techSection = await prisma.section.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'التقنية',
      slug: 'technology',
      description: 'آخر الأخبار والتطورات في عالم التقنية',
      color: '#8B5CF6',
      order: 2,
      views: 1200,
    },
  })

  const scienceSection = await prisma.section.upsert({
    where: { slug: 'science' },
    update: {},
    create: {
      name: 'العلوم',
      slug: 'science',
      description: 'اكتشافات علمية وبحوث متقدمة',
      color: '#F59E0B',
      order: 3,
      views: 950,
    },
  })

  console.log('✅ تم إنشاء الأقسام الرئيسية')

  // إنشاء الوسوم
  const tags = [
    { name: 'الذكاء الاصطناعي', slug: 'ai', color: '#3B82F6', description: 'مقالات عامة حول الذكاء الاصطناعي', usageCount: 15 },
    { name: 'تعلم الآلة', slug: 'machine-learning', color: '#10B981', description: 'خوارزميات ونماذج تعلم الآلة', usageCount: 12 },
    { name: 'التعلم العميق', slug: 'deep-learning', color: '#8B5CF6', description: 'الشبكات العصبية والتعلم العميق', usageCount: 8 },
    { name: 'معالجة اللغة الطبيعية', slug: 'nlp', color: '#F59E0B', description: 'تقنيات فهم ومعالجة اللغة البشرية', usageCount: 6 },
    { name: 'الرؤية الحاسوبية', slug: 'computer-vision', color: '#EF4444', description: 'تحليل ومعالجة الصور والفيديو', usageCount: 5 },
    { name: 'الروبوتات', slug: 'robotics', color: '#06B6D4', description: 'الروبوتات والأتمتة الذكية', usageCount: 4 },
    { name: 'البيانات الضخمة', slug: 'big-data', color: '#84CC16', description: 'تحليل ومعالجة البيانات الضخمة', usageCount: 7 },
    { name: 'إنترنت الأشياء', slug: 'iot', color: '#F97316', description: 'الأجهزة المتصلة والذكية', usageCount: 3 },
    { name: 'الأمن السيبراني', slug: 'cybersecurity', color: '#EC4899', description: 'أمان المعلومات والحماية الرقمية', usageCount: 5 },
    { name: 'البلوك تشين', slug: 'blockchain', color: '#6366F1', description: 'تقنية البلوك تشين والعملات الرقمية', usageCount: 2 },
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
      summary: 'استكشاف كيف سيغير الذكاء الاصطناعي مجال التعليم في السنوات القادمة وتأثيره على طرق التدريس والتعلم',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'مستقبل الذكاء الاصطناعي في التعليم' }]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'يشهد مجال التعليم تطوراً مستمراً مع دخول تقنيات الذكاء الاصطناعي، حيث تفتح هذه التقنيات آفاقاً جديدة لتحسين جودة التعليم وتخصيص التجربة التعليمية لكل طالب.'
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'التطبيقات الحالية' }]
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '1. التعلم التكيفي' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'أنظمة تتكيف مع سرعة تعلم كل طالب' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'محتوى مخصص حسب نقاط القوة والضعف' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'مسارات تعليمية فردية' }]
                  }
                ]
              }
            ]
          }
        ]
      },
      contentText: 'مستقبل الذكاء الاصطناعي في التعليم يشهد مجال التعليم تطوراً مستمراً مع دخول تقنيات الذكاء الاصطناعي، حيث تفتح هذه التقنيات آفاقاً جديدة لتحسين جودة التعليم وتخصيص التجربة التعليمية لكل طالب. التطبيقات الحالية 1. التعلم التكيفي أنظمة تتكيف مع سرعة تعلم كل طالب محتوى مخصص حسب نقاط القوة والضعف مسارات تعليمية فردية',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingTime: 5,
      views: 1250,
      likes: 89,
      shares: 23,
      isFeatured: true,
      allowComments: true,
      metaTitle: 'مستقبل الذكاء الاصطناعي في التعليم - حكاية AI',
      metaDescription: 'اكتشف كيف سيغير الذكاء الاصطناعي مجال التعليم في السنوات القادمة وتأثيره على طرق التدريس والتعلم الحديثة',
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
    { 
      key: 'site_name', 
      value: 'حكاية AI', 
      type: 'string',
      category: 'general',
      description: 'اسم الموقع الرسمي',
      isPublic: true
    },
    { 
      key: 'site_description', 
      value: 'حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم', 
      type: 'string',
      category: 'general',
      description: 'وصف الموقع الرسمي',
      isPublic: true
    },
    { 
      key: 'site_logo', 
      value: '/logo.png', 
      type: 'string',
      category: 'branding',
      description: 'شعار الموقع',
      isPublic: true
    },
    { 
      key: 'posts_per_page', 
      value: 12, 
      type: 'number',
      category: 'content',
      description: 'عدد المقالات في الصفحة الواحدة',
      isPublic: false
    },
    { 
      key: 'allow_comments', 
      value: true, 
      type: 'boolean',
      category: 'content',
      description: 'السماح بالتعليقات على المقالات',
      isPublic: false
    },
    { 
      key: 'comments_moderation', 
      value: true, 
      type: 'boolean',
      category: 'content',
      description: 'مراجعة التعليقات قبل النشر',
      isPublic: false
    },
    { 
      key: 'newsletter_enabled', 
      value: true, 
      type: 'boolean',
      category: 'newsletter',
      description: 'تفعيل النشرة البريدية',
      isPublic: false
    },
    { 
      key: 'analytics_enabled', 
      value: true, 
      type: 'boolean',
      category: 'analytics',
      description: 'تفعيل نظام التحليلات',
      isPublic: false
    },
    { 
      key: 'backup_enabled', 
      value: true, 
      type: 'boolean',
      category: 'system',
      description: 'تفعيل النسخ الاحتياطي التلقائي',
      isPublic: false
    },
    { 
      key: 'maintenance_mode', 
      value: false, 
      type: 'boolean',
      category: 'system',
      description: 'وضع الصيانة',
      isPublic: false
    },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ تم إنشاء إعدادات الموقع')

  // إنشاء تعليقات تجريبية
  await prisma.comment.createMany({
    data: [
      {
        content: 'مقال رائع ومفيد جداً! شكراً لك على هذه المعلومات القيمة حول مستقبل التعليم.',
        authorName: 'أحمد محمد',
        authorEmail: 'ahmed@example.com',
        postId: samplePost.id,
        status: 'APPROVED',
        ipAddress: '192.168.1.100',
      },
      {
        content: 'هل يمكن أن تشاركنا المزيد من التفاصيل حول التطبيقات العملية في المدارس؟',
        authorName: 'فاطمة علي',
        authorEmail: 'fatima@example.com',
        postId: samplePost.id,
        status: 'APPROVED',
        ipAddress: '192.168.1.101',
      },
      {
        content: 'موضوع مهم جداً، خاصة في ظل التطورات السريعة في هذا المجال. أتطلع للمزيد من المقالات.',
        authorName: 'محمد السعيد',
        authorEmail: 'mohammed@example.com',
        postId: samplePost.id,
        status: 'PENDING',
        ipAddress: '192.168.1.102',
      },
    ],
  })

  console.log('✅ تم إنشاء التعليقات التجريبية')

  // إنشاء مشتركين في النشرة البريدية
  await prisma.newsletterSubscriber.createMany({
    data: [
      {
        email: 'subscriber1@example.com',
        name: 'مشترك تجريبي 1',
        status: 'ACTIVE',
        source: 'website',
        verifiedAt: new Date(),
      },
      {
        email: 'subscriber2@example.com',
        name: 'مشترك تجريبي 2',
        status: 'ACTIVE',
        source: 'social_media',
        verifiedAt: new Date(),
      },
      {
        email: 'subscriber3@example.com',
        name: 'مشترك تجريبي 3',
        status: 'PENDING',
        source: 'newsletter_popup',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ تم إنشاء المشتركين في النشرة البريدية')

  // إنشاء بيانات تحليلية تجريبية
  const today = new Date()
  const analyticsData = []

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    analyticsData.push(
      {
        date,
        metric: 'page_views',
        value: Math.floor(Math.random() * 1000) + 500,
        metadata: { source: 'website' },
      },
      {
        date,
        metric: 'unique_visitors',
        value: Math.floor(Math.random() * 300) + 150,
        metadata: { source: 'website' },
      },
      {
        date,
        metric: 'bounce_rate',
        value: Math.floor(Math.random() * 30) + 20,
        metadata: { percentage: true },
      },
      {
        date,
        metric: 'avg_session_duration',
        value: Math.floor(Math.random() * 300) + 120,
        metadata: { unit: 'seconds' },
      }
    )
  }

  await prisma.analytics.createMany({
    data: analyticsData,
    skipDuplicates: true,
  })

  console.log('✅ تم إنشاء البيانات التحليلية التجريبية')

  // إنشاء سجل تدقيق تجريبي
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: 'CREATE',
        target: 'POST',
        targetId: samplePost.id,
        meta: { title: samplePost.title, status: 'PUBLISHED' },
        ipAddress: '192.168.1.1',
      },
      {
        actorId: admin.id,
        action: 'UPDATE',
        target: 'SETTINGS',
        meta: { key: 'site_name', value: 'حكاية AI' },
        ipAddress: '192.168.1.1',
      },
      {
        actorId: editor.id,
        action: 'APPROVE',
        target: 'COMMENT',
        meta: { postTitle: samplePost.title, authorEmail: 'ahmed@example.com' },
        ipAddress: '192.168.1.2',
      },
    ],
  })

  console.log('✅ تم إنشاء سجل التدقيق التجريبي')

  console.log('🎉 تم إنهاء إضافة جميع البيانات الأولية بنجاح!')
  console.log(`
📊 ملخص البيانات المضافة:
- 👥 المستخدمون: 3 (مدير، محرر، كاتب)
- 📂 الأقسام: 4 أقسام (3 رئيسية، 1 فرعي)
- 🏷️ الوسوم: 10 وسوم متنوعة مع إحصائيات الاستخدام
- 📝 المقالات: 1 مقال مميز منشور مع محتوى JSON
- 💬 التعليقات: 3 تعليقات (2 موافق عليها، 1 في الانتظار)
- ⚙️ الإعدادات: 10 إعدادات شاملة مصنفة
- 📧 المشتركون: 3 مشتركين في النشرة البريدية
- 📊 التحليلات: 30 يوم من البيانات التحليلية المتنوعة
- 📋 سجل التدقيق: 3 إدخالات تجريبية مع تفاصيل كاملة

🔐 بيانات تسجيل الدخول:
- المدير: admin@hekaya-ai.com / admin123
- المحرر: editor@hekaya-ai.com / editor123
- الكاتب: author@hekaya-ai.com / author123

🌟 النظام جاهز الآن لبدء استخدام لوحة التحكم المتكاملة!
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

