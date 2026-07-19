# دليل تنصيب ونشر مشروع Tesla Mall

هذا الدليل يغطي ثلاث مراحل بالترتيب:
1. تشغيل المشروع محليًا على جهازك
2. إنشاء مشروع Supabase (قاعدة البيانات + التخزين)
3. رفع المشروع على GitHub ونشره على Vercel

---

## 0) المتطلبات قبل البدء

تأكد من توفر:
- **Node.js 20** أو أحدث — تحقق بالأمر: `node -v`
- **Git** مثبت على جهازك
- حساب على **GitHub**
- حساب على **[Supabase](https://supabase.com)** (مجاني للبدء)
- حساب على **[Vercel](https://vercel.com)** (مجاني للبدء)

---

## 1) فك ضغط المشروع وتثبيت الحزم

```bash
cd tesla-mall
npm install
```

سيقوم هذا الأمر تلقائيًا أيضًا بتوليد Prisma Client بعد التثبيت (`postinstall`).

---

## 2) إنشاء مشروع Supabase

### أ) إنشاء المشروع
1. ادخل إلى [supabase.com/dashboard](https://supabase.com/dashboard) وسجّل الدخول
2. اضغط **New Project**
3. اختر منظمة (Organization) أو أنشئ واحدة
4. املأ:
   - **Name**: `tesla-mall`
   - **Database Password**: كلمة مرور قوية — **احفظها في مكان آمن**، ستحتاجها بعد قليل
   - **Region**: اختر الأقرب لليمن (مثل `eu-central-1` أو ما شابه من الخيارات المتاحة)
5. اضغط **Create new project** وانتظر 1-2 دقيقة حتى يجهز

### ب) الحصول على روابط الاتصال بقاعدة البيانات
1. من القائمة الجانبية: **Project Settings** ← **Database**
2. في قسم **Connection string**، اختر تبويب **URI**
3. ستجد رابطين مهمين (استخدم صيغة **Transaction pooler** للأول و **Session/Direct** للثاني):
   - **Connection pooling (Transaction mode, port 6543)** ← هذا لـ `DATABASE_URL`
   - **Direct connection (port 5432)** ← هذا لـ `DIRECT_URL`
4. انسخ الرابطين، واستبدل `[YOUR-PASSWORD]` بكلمة مرور قاعدة البيانات التي حفظتها

### ج) الحصول على مفاتيح API
1. من القائمة الجانبية: **Project Settings** ← **API**
2. انسخ:
   - **Project URL** ← لـ `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** ← لـ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (اضغط Reveal) ← لـ `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **service_role key** له صلاحيات كاملة على قاعدة البيانات ويتجاوز كل قواعد الأمان — لا تضعه أبدًا في كود يعمل على المتصفح، ولا تشاركه علنًا. في هذا المشروع يُستخدم فقط من كود الخادم (Server-side).

### د) إنشاء Storage Bucket لصور المنتجات
1. من القائمة الجانبية: **Storage**
2. اضغط **New bucket**
3. الاسم: `tesla-mall-media` (يجب أن يطابق تمامًا قيمة `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`)
4. فعّل خيار **Public bucket** ✅ (حتى تكون روابط الصور قابلة للعرض في المتجر مباشرة)
5. اضغط **Create bucket**

---

## 3) إعداد متغيرات البيئة محليًا

انسخ ملف الأمثلة:

```bash
cp .env.example .env.local
```

افتح `.env.local` واملأ القيم التي جمعتها:

```bash
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-xxxxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-xxxxx.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
SUPABASE_SERVICE_ROLE_KEY="ey..."
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="tesla-mall-media"
```

### توليد `AUTH_SECRET`
هذا مفتاح تشفير الجلسات، يجب أن يكون عشوائيًا وسريًا:

```bash
npx auth secret
```

سيضيف الأمر القيمة تلقائيًا لملف `.env.local` باسم `AUTH_SECRET`. إن لم يعمل، يمكنك توليد قيمة يدويًا:

```bash
openssl rand -base64 32
```

وضعها يدويًا:
```bash
AUTH_SECRET="القيمة-الناتجة"
AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUST_HOST="true"
```

باقي المتغيرات (بوابات الدفع، SMS، Sentry...) **اتركها فارغة حاليًا** — غير مطلوبة لتشغيل المتجر (الدفع فيه عند الاستلام فقط).

---

## 4) إنشاء الجداول وتعبئة بيانات تجريبية

```bash
npx prisma migrate dev --name init
```

هذا الأمر سينشئ كل الجداول في قاعدة بيانات Supabase، ويولّد ملف هجرة (migration) نحتاجه لاحقًا في النشر.

ثم عبّئ بيانات تجريبية (تصنيفات، مناطق شحن، حساب أدمن):

```bash
npm run db:seed
```

بعد التنفيذ ستظهر رسالة تؤكد جهوزية حساب الأدمن:
- **رقم الهاتف:** `+967770288967`
- **كلمة المرور:** `ChangeMe123!`

⚠️ **غيّر هذه الكلمة فورًا** بعد أول تسجيل دخول (من لوحة التحكم لاحقًا، أو مباشرة من قاعدة البيانات إن لم تكن هناك صفحة لتغيير كلمة المرور بعد).

---

## 5) تشغيل المشروع محليًا

```bash
npm run dev
```

افتح `http://localhost:3000` — يجب أن تظهر الواجهة الرئيسية بالعربية (RTL).
سجّل الدخول للوحة التحكم على `http://localhost:3000/admin` بحساب الأدمن أعلاه.

قبل المتابعة، تحقق من عدم وجود أخطاء برمجية:

```bash
npm run typecheck
npm run lint
```

---

## 6) رفع المشروع على GitHub

```bash
git init                      # فقط إذا لم يكن قد تم عمل git init من قبل
git add .
git commit -m "Initial commit"
```

أنشئ مستودعًا جديدًا فارغًا على GitHub (بدون README) ثم:

```bash
git remote add origin https://github.com/USERNAME/tesla-mall.git
git branch -M main
git push -u origin main
```

> **تنبيه:** تأكد أن ملف `.env.local` **غير مرفوع** (موجود ضمن `.gitignore` افتراضيًا) — لا تضع أسرارك في GitHub أبدًا.

---

## 7) النشر على Vercel

### الطريقة الأسهل: عبر واجهة Vercel مباشرة

1. ادخل إلى [vercel.com/new](https://vercel.com/new)
2. اربط حساب GitHub إن لم يكن مربوطًا، واختر مستودع `tesla-mall`
3. في شاشة الإعداد (Configure Project):
   - **Framework Preset**: سيكتشف Next.js تلقائيًا
   - افتح قسم **Environment Variables** وأضف كل المتغيرات من `.env.local` (نفس الأسماء والقيم)، أهمها:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
     - `AUTH_SECRET`
     - `AUTH_TRUST_HOST` = `true`
     - `AUTH_URL` = `https://your-project.vercel.app/api/auth` (حدّثه لاحقًا بالنطاق النهائي)
     - `NEXT_PUBLIC_APP_URL` = رابط النشر النهائي
4. اضغط **Deploy** وانتظر انتهاء البناء

### تطبيق قاعدة البيانات على الإنتاج

بعد أول نشر، طبّق الهجرة نفسها (المُولّدة في الخطوة 4) على قاعدة بيانات الإنتاج (وهي نفس قاعدة Supabase التي أنشأتها، ما لم تُنشئ قاعدة منفصلة للإنتاج):

```bash
npx prisma migrate deploy
```

(نفّذ هذا الأمر من جهازك مع تأكدك أن `.env.local` يشير لنفس قاعدة بيانات الإنتاج، أو مرّر المتغيرات مباشرة قبل الأمر).

### ربط النطاق الخاص (teslamall.com)

1. من لوحة Vercel للمشروع: **Settings** ← **Domains**
2. أضف `teslamall.com` و `www.teslamall.com`
3. اذهب إلى مزوّد النطاق لديك وأضف سجلات DNS التي يعرضها Vercel (عادة سجل `A` أو `CNAME`)
4. بعد انتشار DNS (قد يأخذ حتى 24 ساعة)، حدّث المتغيرات التالية في Vercel لتطابق النطاق النهائي، ثم أعد النشر:
   - `NEXT_PUBLIC_APP_URL="https://teslamall.com"`
   - `AUTH_URL="https://teslamall.com/api/auth"`

### (اختياري) تفعيل النشر التلقائي عبر GitHub Actions

المشروع يحتوي مسبقًا على `.github/workflows/deploy.yml` للنشر التلقائي عند كل push على `main`. لتفعيله أضف في GitHub: **Settings** ← **Secrets and variables** ← **Actions**:
- `VERCEL_TOKEN` (من Vercel: **Account Settings** ← **Tokens**)
- `VERCEL_ORG_ID` و `VERCEL_PROJECT_ID` (من ملف `.vercel/project.json` الذي يظهر بعد ربط المشروع مرة واحدة عبر `npx vercel link`)

هذا اختياري بالكامل — الربط المباشر بين Vercel وGitHub (الطريقة الأولى) يكفي وحده لنشر تلقائي عند كل push.

---

## 8) بعد النشر — قائمة تحقق نهائية

- [ ] تسجيل الدخول بحساب الأدمن وتغيير كلمة المرور الافتراضية
- [ ] التأكد أن bucket الصور `tesla-mall-media` عام (Public) فعليًا
- [ ] رفع صورة تجريبية من لوحة التحكم للتأكد أن الرفع يعمل
- [ ] مراجعة مناطق وأسعار الشحن من **الإعدادات** في لوحة التحكم
- [ ] إضافة منتجات حقيقية (أو حذف البيانات التجريبية إن أردت البدء من الصفر)
- [ ] اختبار عملية شراء كاملة من البداية للنهاية (تسجيل، إضافة للسلة، إتمام الطلب)

---

## ملاحظات ختامية

- **بوابات الدفع** (كريمي، جوالي، جيب) وSMS/OTP وSentry — كل المتغيرات الخاصة بها موجودة في `.env.example` لكنها **غير مفعّلة حاليًا** في الكود، لأن المتجر يعمل حاليًا بنظام الدفع عند الاستلام فقط، بناءً على طلبك السابق.
- **رفع الصور** يعتمد كليًا على bucket الـ Supabase الذي أنشأته في الخطوة 2-د — إن لم يكن عامًا (Public)، لن تظهر الصور في المتجر رغم نجاح الرفع.
- إن واجهتك أي مشكلة أثناء `prisma migrate dev`، غالبًا السبب هو خطأ في صيغة `DATABASE_URL`/`DIRECT_URL` أو كلمة مرور قاعدة البيانات — تحقق منها أولًا.
