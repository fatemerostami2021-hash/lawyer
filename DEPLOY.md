# راهنمای انتقال و استقرار SOBHAN NIKSERESHT LAW

## ۱) دریافت و unzip در Git Bash ویندوز

فایل ZIP را دانلود کنید و در پوشه‌ی فعلی پروژه، یعنی `/e/lawyer` قرار دهید. سپس در Git Bash اجرا کنید:

```bash
cd /e/lawyer
unzip sobhanlaw-site.zip -d sobhanlaw-site
cd sobhanlaw-site
```

اگر دستور `unzip` روی ویندوز شما نصب نبود، فایل ZIP را با Windows Explorer استخراج کنید و سپس:

```bash
cd /e/lawyer/sobhanlaw-site
```

## ۲) نصب و باز کردن خودکار در Chrome

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:static &
start chrome http://localhost:3000
```

اگر `start chrome` کار نکرد، این دستور را امتحان کنید:

```bash
cmd //c start chrome http://localhost:3000
```

برای توقف سرور در همان ترمینال `Ctrl+C` بزنید.

## ۳) ساخت نسخه production محلی

```bash
pnpm check
pnpm build:static
```

خروجی production در `dist/public` ساخته می‌شود.

## ۴) قرار دادن در GitHub

در GitHub یک repository جدید بسازید، سپس از داخل پوشه پروژه اجرا کنید:

```bash
git init
git add .
git commit -m "Initial SOBHAN NIKSERESHT LAW website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

آدرس repository خود را جایگزین `YOUR-USERNAME/YOUR-REPOSITORY` کنید.

## ۵) استقرار در Vercel

در Vercel گزینه‌ی **Add New Project** را انتخاب کنید، repository گیت‌هاب را import کنید و Deploy را بزنید. فایل `vercel.json` از قبل build را روی `dist/public` تنظیم کرده است.

مقادیر پیشنهادی Vercel:

- Framework Preset: `Vite`
- Build Command: `pnpm install --frozen-lockfile && pnpm build:static`
- Output Directory: `dist/public`
- Install Command: `corepack enable && pnpm install --frozen-lockfile`

هیچ environment variable محرمانه‌ای برای نسخه‌ی فعلی لازم نیست.

## اطلاعات واقعی سایت

اطلاعات تماس و شبکه‌های اجتماعی در فایل `client/src/lib/site.ts` قرار دارند و از همان فایل قابل ویرایش هستند.
