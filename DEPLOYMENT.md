# 🚀 نشر مشروع حكاية AI على Vercel

## الخطوات المطلوبة:

### 1. إعداد قاعدة البيانات

أولاً، تحتاج إلى إنشاء قاعدة بيانات PostgreSQL. يمكنك استخدام:

**الخيار الأول: Supabase (مجاني ومُوصى به)**
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى Settings → Database
4. انسخ Connection String

**الخيار الثاني: Railway**
1. اذهب إلى [railway.app](https://railway.app)
2. أنشئ PostgreSQL database جديد
3. انسخ DATABASE_URL من المتغيرات

**الخيار الثالث: Neon**
1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ مشروع جديد
3. انسخ Connection String

### 2. النشر على Vercel

#### الطريقة الأولى: من GitHub (مُوصى بها)

1. ادفع الكود إلى GitHub repository:
\`\`\`bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
\`\`\`

2. اذهب إلى [vercel.com](https://vercel.com)
3. اربط حسابك بـ GitHub
4. اختر "Import Project"
5. اختر repository الخاص بك
6. Vercel سيتعرف تلقائياً على Next.js

#### الطريقة الثانية: Vercel CLI

\`\`\`bash
npm install -g vercel
vercel login
vercel --prod
\`\`\`

### 3. إعداد متغيرات البيئة في Vercel

في لوحة تحكم Vercel:
1. اذهب إلى Settings → Environment Variables
2. أضف هذه المتغيرات:

\`\`\`
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
\`\`\`

**مهم:** 
- `NEXTAUTH_SECRET`: أنشئ مفتاح عشوائي قوي
- استبدل `your-vercel-domain` بالدومين الفعلي

### 4. إعداد قاعدة البيانات

بعد النشر الأول، ستحتاج لإعداد قاعدة البيانات:

1. في Vercel Dashboard، اذهب إلى Functions tab
2. أو استخدم Vercel CLI محلياً:

\`\`\`bash
# إعداد قاعدة البيانات
vercel env pull .env.local
npm run db:seed
\`\`\`

### 5. تحديث DNS (اختياري)

إذا كان لديك دومين مخصص:
1. في Vercel Dashboard → Settings → Domains
2. أضف الدومين الخاص بك
3. اتبع التعليمات لإعداد DNS

## المتغيرات المطلوبة:

### ضرورية:
- `DATABASE_URL` - رابط قاعدة البيانات PostgreSQL
- `NEXTAUTH_SECRET` - مفتاح تشفير للمصادقة
- `NEXTAUTH_URL` - رابط موقعك الأساسي

### اختيارية:
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `OPENAI_API_KEY` - للميزات المتقدمة
- Cloudinary للصور
- SMTP للإيميلات

## بيانات تسجيل الدخول الافتراضية:

بعد إعداد قاعدة البيانات:
- **المدير**: admin@hekaya-ai.com / admin123
- **المحرر**: editor@hekaya-ai.com / editor123  
- **الكاتب**: author@hekaya-ai.com / author123

## استكشاف الأخطاء:

### خطأ في قاعدة البيانات:
- تأكد من صحة `DATABASE_URL`
- تأكد من أن قاعدة البيانات تدعم SSL

### خطأ في البناء:
- تأكد من أن جميع المتغيرات مضافة في Vercel
- تحقق من logs في Vercel Dashboard

### خطأ في Prisma:
- تأكد من تشغيل `prisma generate`
- قد تحتاج إلى `prisma db push`

## الدعم:

إذا واجهت أي مشاكل:
1. تحقق من Vercel logs
2. تأكد من إعدادات قاعدة البيانات  
3. تأكد من صحة جميع متغيرات البيئة

🎉 **مبروك! موقعك الآن جاهز على الإنترنت**
