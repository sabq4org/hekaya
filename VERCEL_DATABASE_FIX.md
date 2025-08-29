# إصلاح اتصال قاعدة البيانات على Vercel

## المشكلة:
رابط pooling الحالي لا يعمل. نحتاج لاستخدام الرابط الصحيح من Supabase.

## الحل - استخدم هذه المتغيرات على Vercel:

### 1. DATABASE_URL (رابط Pooling للتطبيق)
هذا الرابط يجب أن يكون على المنفذ **6543** (وليس 5432):
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. DIRECT_URL (رابط مباشر للترحيلات)
```
postgresql://postgres:qyjnuq_3sukvakYbvur@db.umeafcsjdywgxxbkbxyp.supabase.co:5432/postgres
```

## ملاحظات مهمة:
- لاحظ أن DATABASE_URL يستخدم المنفذ **6543** (وليس 5432)
- تأكد من إضافة `?pgbouncer=true` في نهاية DATABASE_URL
- DIRECT_URL يستخدم المنفذ 5432 (للترحيلات فقط)

## خطوات الإصلاح على Vercel:
1. اذهب إلى Vercel Dashboard > Settings > Environment Variables
2. احذف DATABASE_URL القديم
3. أضف DATABASE_URL الجديد مع المنفذ 6543
4. تأكد من وجود DIRECT_URL
5. اضغط "Redeploy" لتطبيق التغييرات

## للتحقق من صحة الرابط محلياً:
```bash
# اختبر رابط Pooling (المنفذ 6543)
psql "postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"

# اختبر الرابط المباشر (المنفذ 5432)
psql "postgresql://postgres:qyjnuq_3sukvakYbvur@db.umeafcsjdywgxxbkbxyp.supabase.co:5432/postgres"
```
