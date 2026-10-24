# طرح اجرایی — SOBHAN NIKSERESHT LAW / نسخه چندصفحه‌ای سه‌بعدی

## هدف نسخه جدید

سایت از یک landing page تک‌صفحه‌ای به یک تجربه وب حقوقی چندصفحه‌ای، پویا و قابل رشد تبدیل می‌شود. هویت موجود سرمه‌ای/طلایی حفظ می‌شود اما لایه‌ی بصری آن به یک فضای کهکشانی با صحنه سه‌بعدی تبدیل خواهد شد. تمرکز تجربه روی اعتماد، خوانایی حقوقی و حرکت کنترل‌شده است؛ نه انیمیشن‌های پرسرعت یا تزئینی که خواندن متن را مختل کنند.

## معماری و مسیرها

- `/`: صفحه خانه با صحنه Three.js، ترازوی طلایی procedural، ذرات ستاره‌ای، لوگوی متحرک و معرفی کوتاه.
- `/about`: معرفی مجموعه، فلسفه کاری، زبان‌ها و موقعیت برند.
- `/expertise`: حوزه‌های Corporate Structuring، Commercial Contracts، Foreign Investment، Dispute Resolution و IP/Brands.
- `/approach`: متد Understand / Structure / Execute به‌صورت صفحه مستقل.
- `/insights`: فهرست وبلاگ با فیلتر موضوعی و کارت‌های متحرک.
- `/insights/:slug`: صفحه کامل هر مقاله با عنوان، زمان مطالعه، متن آموزشی، هشدار حقوقی و منابع رسمی.
- `/contact`: اطلاعات تماس واقعی، لینک شبکه‌های اجتماعی و فرم درخواست مشاوره.
- `/404`: صفحه خطای موجود قالب حفظ می‌شود.

## پیاده‌سازی سه‌بعدی و حرکت

- Three.js یک صحنه reusable در `client/src/components/CosmicScene.tsx` می‌سازد: پس‌زمینه کهکشانی، starfield، حلقه‌های مداری، glow و ترازوی طلایی procedural با beam، chains و pans.
- `client/src/components/AnimatedScaleMark.tsx` لوگوی ترازو را به‌جای SN نمایش می‌دهد؛ با blink کنترل‌شده و چرخش ظریف محور/حلقه‌ها.
- GSAP برای page transition، scroll reveal، hover tilt و پارالاکس محدود استفاده می‌شود. `prefers-reduced-motion` باید همه حرکت‌های غیرضروری را خاموش یا بسیار محدود کند.
- صحنه Three.js باید روی موبایل سبک‌تر شود، pixel ratio محدود داشته باشد، listenerها را در unmount پاک کند و در صورت عدم پشتیبانی WebGL fallback تصویری داشته باشد.

## زبان و ناوبری

سوییچر زبان با پرچم/نشان تصویری ایران، بریتانیا و امارات نمایش داده می‌شود؛ انتخاب زبان در state رابط و direction سند اعمال می‌شود. متن UI برای فارسی، English و العربية آماده است. محتوای حقوقی اصلی ابتدا انگلیسی و فارسی خواهد بود و عنوان/متادیتا و برچسب‌های کلیدی عربی نیز ارائه می‌شود.

## وبلاگ و محتوای حقوقی

پنج مقاله آموزشی با منابع رسمی و بین‌المللی معتبر آماده می‌شود: ثبت و حاکمیت شرکت‌ها در ایران، قراردادهای تجاری، سرمایه‌گذاری خارجی و FIPPA، داوری تجاری، و برند/علامت تجاری و مالکیت فکری. هر مقاله شامل منابع لینک‌شده و disclaimer است و ادعای مشاوره شخصی یا نتیجه قطعی درباره پرونده ندارد. منابع پژوهش در `client/src/content/legalContent.ts` نگهداری می‌شوند.

## ساختار فایل

- `client/src/App.tsx`: route map چندصفحه‌ای.
- `client/src/components/SiteChrome.tsx`: header، navigation، language switcher، footer و cosmic background.
- `client/src/components/CosmicScene.tsx`: صحنه Three.js مشترک.
- `client/src/components/AnimatedScaleMark.tsx`: نشان متحرک ترازو.
- `client/src/pages/*`: صفحات Home، About، Expertise، Approach، Insights، InsightDetail و Contact.
- `client/src/content/legalContent.ts`: داده و منابع مقالات.
- `client/src/lib/site.ts`: اطلاعات تماس و شبکه‌های اجتماعی واقعی.
- `client/src/index.css`: سیستم visual، responsive، galaxy background و reduced-motion.
- `public/manus-routes.json`: manifest کامل مسیرها.

## رفتارهای قابل تکمیل بعدی

فرم تماس فعلاً در سطح رابط کاربری ثبت موفقیت نشان می‌دهد و به سرویس ارسال متصل نیست. برای اتصال واقعی باید مقصد ایمیل/notification یا backend اعلام شود. تغییرات حقوقی آینده باید با مرور متن جاری قانون و تاریخ به‌روزرسانی مقاله انجام شوند.
