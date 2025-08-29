# إصلاح رابط قاعدة البيانات النهائي

## المشكلة:
كلمة المرور تحتوي على شرطة سفلية (_) قد تحتاج لترميز خاص.

## جرّب أحد هذه الروابط على Vercel:

### الخيار 1: بدون معاملات إضافية
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

### الخيار 2: مع pgbouncer=true
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### الخيار 3: مع ترميز URL لكلمة المرور
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq%5F3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

### الخيار 4: استخدام رابط Transaction pooling من Supabase Dashboard
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com/project/umeafcsjdywgxxbkbxyp/settings/database)
2. ابحث عن "Connection string" 
3. اختر "Transaction" mode
4. انسخ الرابط مباشرة من هناك

## نصائح:
- تأكد من عدم وجود مسافات في بداية أو نهاية الرابط
- تأكد من أن المنفذ هو 6543 (وليس 5432)
- إذا فشلت كل المحاولات، اذهب لـ Supabase Dashboard وانسخ رابط "Transaction pooling" مباشرة
