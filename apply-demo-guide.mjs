// Run once from the project root:  node apply-demo-guide.mjs
// Points the header button of the website to /demo (the "client panel / lawyer panel" chooser page).
import fs from 'node:fs';
const f = 'client/src/components/SiteChrome.tsx';
if (!fs.existsSync(f)) { console.error('SiteChrome.tsx not found - run this from the project root (where package.json is).'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const before = s;
s = s.split('href="/portal"').join('href="/demo"');
s = s.replace('fa: "پورتال موکلان", en: "Client Portal", ar: "بوابة العملاء"', 'fa: "ورود به پنل‌ها", en: "Sign in", ar: "تسجيل الدخول"');
if (s === before) console.log('nothing to change (already done?)');
else { fs.writeFileSync(f, s); console.log('patched: SiteChrome.tsx (header button now opens /demo)'); }
