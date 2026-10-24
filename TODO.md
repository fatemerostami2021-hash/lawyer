# TODO — SOBHAN NIKSERESHT LAW / Dynamic Multi-page Release

## تجربه سه‌بعدی و برند متحرک

- [x] جایگزینی SN با نشان ترازو در لوگو و اجرای blink/rotation کنترل‌شده.
- [x] افزودن صحنه Three.js مشترک با galaxy background، starfield، orbit rings و ترازوی طلایی procedural.
- [x] افزودن GSAP page transition، scroll reveal، parallax و hover tilt با پشتیبانی `prefers-reduced-motion`.
- [x] افزودن fallback تصویری و محدودسازی pixel ratio برای موبایل و دستگاه‌های بدون WebGL.

## صفحات و ناوبری

- [x] ایجاد صفحات مستقل `/`, `/about`, `/expertise`, `/approach`, `/insights`, `/insights/:slug` و `/contact`.
- [x] فعال‌سازی ناوبری واقعی بین صفحات و به‌روزرسانی `manus-routes.json`.
- [x] تغییر language switcher به پرچم‌های ایران، بریتانیا و امارات با direction درست برای فارسی و عربی.

## وبلاگ معتبر

- [x] ایجاد پنج مقاله آموزشی درباره حاکمیت شرکت‌ها، قراردادهای تجاری، سرمایه‌گذاری خارجی/FIPPA، داوری و مالکیت فکری.
- [x] درج منابع رسمی/بین‌المللی و disclaimer آموزشی در هر مقاله.
- [x] ساخت فهرست وبلاگ با فیلتر موضوعی و صفحه جزئیات هر مقاله.

## تماس و برند

- [x] شماره `09177892994`، ایمیل `fatimarostami963369@gmail.com`، آدرس شیراز و لینک‌های اجتماعی واقعی در `site.ts` ثبت شده‌اند.
- [ ] اتصال فرم تماس به مقصد واقعی ایمیل/notification پس از اعلام سرویس مقصد.

## اعتبارسنجی

- [x] اجرای `pnpm check` و `pnpm build:static` بدون خطای TypeScript یا build.
- [x] بررسی Preview در دسکتاپ و موبایل و کنترل fallback WebGL.
