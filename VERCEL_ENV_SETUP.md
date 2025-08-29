# إعداد متغيرات البيئة على Vercel

## متغيرات قاعدة البيانات المطلوبة:

### 1. DATABASE_URL (للتطبيق - استخدام Pooling)
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

### 2. DIRECT_URL (للترحيلات - اتصال مباشر)
```
postgresql://postgres:qyjnuq_3sukvakYbvur@db.umeafcsjdywgxxbkbxyp.supabase.co:5432/postgres
```

## متغيرات NextAuth المطلوبة:

### 3. NEXTAUTH_URL
```
https://hekaya-taupe.vercel.app
```

### 4. NEXTAUTH_SECRET
```
# قم بتوليد سر عشوائي باستخدام:
openssl rand -base64 32
```

## خطوات الإعداد على Vercel:

1. افتح مشروعك على [Vercel Dashboard](https://vercel.com/dashboard)
2. اذهب إلى Settings > Environment Variables
3. أضف المتغيرات الأربعة أعلاه
4. اضغط على "Redeploy" لتطبيق التغييرات

## ملاحظة مهمة:
- تأكد من إضافة `?pgbouncer=true&connection_limit=1` لـ DATABASE_URL
- لا تنسى توليد NEXTAUTH_SECRET جديد وآمن
