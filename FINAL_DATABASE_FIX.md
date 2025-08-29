# الحل النهائي لخطأ Prepared Statements

## المشكلة:
PgBouncer مع Supabase لا يدعم prepared statements في وضع Transaction pooling، مما يسبب الخطأ:
```
prepared statement "s0" already exists
```

## الحل النهائي - استخدم هذه الروابط على Vercel:

### DATABASE_URL (مع تعطيل prepared statements):
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0
```

### أو إذا لم يعمل، جرّب:
```
postgresql://postgres.umeafcsjdywgxxbkbxyp:qyjnuq_3sukvakYbvur@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?statement_cache_size=0
```

### DIRECT_URL (يبقى كما هو):
```
postgresql://postgres:qyjnuq_3sukvakYbvur@db.umeafcsjdywgxxbkbxyp.supabase.co:5432/postgres
```

## معاملات مهمة:
- `statement_cache_size=0` - يعطل prepared statements
- `pgbouncer=true` - يخبر Prisma أننا نستخدم PgBouncer

## إذا استمرت المشكلة، أضف في schema.prisma:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  // أضف هذا السطر
  relationMode = "prisma"
}
```

## المصدر:
https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
