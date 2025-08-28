# 🚀 حكاية AI - منصة المحتوى العربي للذكاء الاصطناعي

<div align="center">

![حكاية AI](https://img.shields.io/badge/حكاية_AI-منصة_المحتوى_العربي-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

**حيث يلتقي الخيال بالعلم، وتتحول الخوارزميات إلى حكايات تلهم وتعلّم**

[🌐 الموقع المباشر](https://hekaya-ai.manus.chat) | [📚 التوثيق](#التوثيق) | [🤝 المساهمة](#المساهمة)

</div>

---

## 📖 نظرة عامة

**حكاية AI** هي منصة محتوى عربية متخصصة في الذكاء الاصطناعي والتقنيات الحديثة. تهدف المنصة إلى تقديم محتوى عالي الجودة باللغة العربية حول أحدث التطورات في عالم الذكاء الاصطناعي، مع التركيز على التطبيقات العملية والقصص الملهمة.

### ✨ الميزات الرئيسية

- 🎨 **تصميم عربي أصيل** مع دعم RTL كامل
- 📝 **نظام إدارة محتوى متقدم** (CMS)
- ✍️ **محرر متطور** مع دعم الوسائط المتعددة
- 🔍 **تحسين محركات البحث** (SEO) متقدم
- 📱 **تصميم متجاوب** لجميع الأجهزة
- 🔐 **نظام مصادقة آمن** مع أدوار متعددة
- 💬 **نظام تعليقات تفاعلي**
- 📊 **لوحة تحكم تحليلية** شاملة

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15** - إطار عمل React للتطبيقات الحديثة
- **TypeScript** - لكتابة كود آمن ومنظم
- **Tailwind CSS** - للتصميم السريع والمرن
- **IBM Plex Sans Arabic** - خط عربي أنيق ومقروء

### Backend
- **Next.js API Routes** - للخدمات الخلفية
- **Prisma ORM** - لإدارة قاعدة البيانات
- **NextAuth.js** - لنظام المصادقة
- **Supabase** - قاعدة بيانات PostgreSQL

### أدوات التطوير
- **ESLint** - لفحص جودة الكود
- **Prettier** - لتنسيق الكود
- **Husky** - لـ Git hooks

---

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js 18.0 أو أحدث
- npm أو yarn أو pnpm
- قاعدة بيانات PostgreSQL (Supabase)

### التثبيت

1. **استنساخ المستودع**
```bash
git clone https://github.com/sabq4org/hekaya.git
cd hekaya
```

2. **تثبيت التبعيات**
```bash
npm install
# أو
yarn install
# أو
pnpm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env.local
```

قم بتحديث الملف `.env.local` بالقيم المناسبة:

```env
# قاعدة البيانات
DATABASE_URL="postgresql://username:password@localhost:5432/hekaya"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (اختياري)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. **إعداد قاعدة البيانات**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **تشغيل الخادم المحلي**
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح لرؤية الموقع.

---

## 📁 هيكل المشروع

```
hekaya-ai/
├── src/
│   ├── app/                    # صفحات Next.js App Router
│   │   ├── admin/             # لوحة التحكم الإدارية
│   │   ├── api/               # API Routes
│   │   ├── articles/          # صفحات المقالات
│   │   └── globals.css        # الأنماط العامة
│   ├── components/            # المكونات القابلة لإعادة الاستخدام
│   │   ├── admin/             # مكونات لوحة التحكم
│   │   ├── editor/            # محرر المحتوى
│   │   ├── layout/            # مكونات التخطيط
│   │   └── ui/                # مكونات واجهة المستخدم
│   ├── lib/                   # المكتبات والأدوات المساعدة
│   │   ├── auth.ts            # إعدادات المصادقة
│   │   ├── prisma.ts          # إعداد Prisma
│   │   └── utils.ts           # دوال مساعدة
│   └── types/                 # تعريفات TypeScript
├── prisma/                    # مخططات قاعدة البيانات
│   ├── schema.prisma          # نموذج البيانات
│   └── migrations/            # ملفات الهجرة
├── public/                    # الملفات الثابتة
│   ├── images/                # الصور
│   └── icons/                 # الأيقونات
├── tailwind.config.ts         # إعدادات Tailwind
├── next.config.ts             # إعدادات Next.js
└── package.json               # تبعيات المشروع
```

---

## 🎯 الميزات المتقدمة

### 📝 نظام إدارة المحتوى (CMS)

- **محرر متقدم** مع دعم:
  - الإيموجي والرموز 😊
  - تضمين الصور والفيديو 🖼️
  - اقتباسات أنيقة 💬
  - أكواد برمجية مع نسخ 💻
  - جداول تفاعلية 📊
  - تضمين Twitter و YouTube 🐦

### 🔐 نظام الأدوار والصلاحيات

- **ADMIN**: صلاحيات كاملة
- **EDITOR**: تحرير ومراجعة المحتوى
- **AUTHOR**: كتابة المقالات
- **READER**: قراءة والتعليق

### 📊 لوحة التحكم التحليلية

- إحصائيات شاملة للموقع
- تحليل أداء المقالات
- إدارة التعليقات والمستخدمين
- تقارير مفصلة

### 🔍 تحسين محركات البحث (SEO)

- خريطة موقع تلقائية
- RSS Feed
- بيانات منظمة (Schema.org)
- صور OpenGraph مولدة
- تحسين الأداء (Lighthouse 95+)

---

## 🎨 التخصيص

### الألوان والخطوط

يمكنك تخصيص الألوان والخطوط من خلال ملف `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        background: '#f8f8f7',
        border: '#f0f0ef',
      },
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### إضافة مكونات جديدة

```bash
# إنشاء مكون جديد
mkdir src/components/my-component
touch src/components/my-component/index.tsx
```

---

## 📚 التوثيق

### API Routes

#### المقالات
- `GET /api/posts` - جلب جميع المقالات
- `POST /api/posts` - إنشاء مقال جديد
- `GET /api/posts/[id]` - جلب مقال محدد
- `PUT /api/posts/[id]` - تحديث مقال
- `DELETE /api/posts/[id]` - حذف مقال

#### التصنيفات
- `GET /api/categories` - جلب جميع التصنيفات
- `POST /api/categories` - إنشاء تصنيف جديد

#### التعليقات
- `GET /api/comments` - جلب التعليقات
- `POST /api/comments` - إضافة تعليق جديد

### قاعدة البيانات

يستخدم المشروع Prisma ORM مع PostgreSQL. يمكنك العثور على نموذج البيانات في `prisma/schema.prisma`.

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm run test

# اختبارات التكامل
npm run test:e2e

# فحص جودة الكود
npm run lint

# تنسيق الكود
npm run format
```

---

## 🚀 النشر

### Vercel (موصى به)

1. ادفع الكود إلى GitHub
2. اربط المستودع مع Vercel
3. أضف متغيرات البيئة
4. انشر!

### Docker

```bash
# بناء الصورة
docker build -t hekaya-ai .

# تشغيل الحاوية
docker run -p 3000:3000 hekaya-ai
```

### النشر اليدوي

```bash
# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. **Fork** المستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. تنفيذ التغييرات (`git commit -m 'Add amazing feature'`)
4. دفع التغييرات (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### إرشادات المساهمة

- اتبع معايير الكود الموجودة
- أضف اختبارات للميزات الجديدة
- حدث التوثيق عند الحاجة
- استخدم رسائل commit واضحة

---

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👥 الفريق

- **المطور الرئيسي**: فريق حكاية AI
- **التصميم**: متخصصون في UX/UI العربية
- **المحتوى**: خبراء الذكاء الاصطناعي

---

## 📞 التواصل

- **الموقع**: [hekaya-ai.manus.chat](https://hekaya-ai.manus.chat)
- **البريد الإلكتروني**: info@hekaya-ai.com
- **تويتر**: [@HekayaAI](https://twitter.com/HekayaAI)
- **لينكد إن**: [حكاية AI](https://linkedin.com/company/hekaya-ai)

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org) - إطار العمل الرائع
- [Tailwind CSS](https://tailwindcss.com) - للتصميم السريع
- [Prisma](https://prisma.io) - لإدارة قاعدة البيانات
- [Supabase](https://supabase.com) - للبنية التحتية
- [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic) - للخط العربي الجميل

---

<div align="center">

**صنع بـ ❤️ للمحتوى العربي**

![حكاية AI](https://img.shields.io/badge/حكاية_AI-2025-blue?style=for-the-badge)

</div>

