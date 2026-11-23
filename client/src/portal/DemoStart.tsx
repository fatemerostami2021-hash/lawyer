import { Link } from "wouter";
import { Briefcase, Scale } from "lucide-react";

// Landing page of the sample website: two separate doors (client panel / lawyer panel).
export default function DemoStart() {
  return <div className="ds-wrap"><div className="ds-in">
    <div className="ds-head"><div className="pt-logo" style={{ width: 52, height: 52, fontSize: 18 }}>SN</div>
      <h1>وب‌سایت نمونه‌ی دفتر وکالت</h1>
      <p>این یک وب‌سایت نمونه است؛ دو پنل جدا دارد و می‌توانید هر کدام را مثل کاربر واقعی امتحان کنید. اطلاعات این دو پنل با هم قاطی نمی‌شود و تغییرات فقط در همین مرورگر شما ذخیره می‌شود.</p></div>
    <div className="ds-grid">
      <section className="ds-card">
        <div className="ds-ic"><Briefcase size={26} /></div>
        <h2>پنل کاربری موکل</h2>
        <p className="ds-sub">برای کسی که می‌خواهد حساب بسازد، نوبت بگیرد و پرونده‌اش را دنبال کند.</p>
        <ol>
          <li>با شماره موبایل وارد شوید؛ کد تأیید همان لحظه روی صفحه نشان داده می‌شود.</li>
          <li>شماره جدید = ساخت حساب تازه (فقط نام را وارد کنید).</li>
          <li>پروفایل را کامل کنید و مدارک بارگذاری کنید.</li>
          <li>از تقویم، روز و ساعت مشاوره را انتخاب کنید و نوبت بگیرید.</li>
          <li>نتیجه‌ی نوبت و پیام‌های دفتر را در پنل ببینید.</li>
        </ol>
        <div className="ds-note">برای دیدن موکلی که پرونده دارد: <b className="ltr">09120000001</b></div>
        <Link href="/portal" className="btn gold ds-btn">ورود به پنل موکل</Link>
      </section>
      <section className="ds-card">
        <div className="ds-ic"><Scale size={26} /></div>
        <h2>پنل کاربری وکیل</h2>
        <p className="ds-sub">برای وکیل و منشی دفتر؛ مدیریت همه‌ی موکلان، پرونده‌ها و نوبت‌ها.</p>
        <ol>
          <li>با نام کاربری و رمز نمونه وارد شوید (در صفحه‌ی ورود با یک کلیک پر می‌شود).</li>
          <li>نوبت‌هایی که موکلان گرفته‌اند را تأیید، رد یا زمان جدید پیشنهاد کنید.</li>
          <li>موکلان، پرونده‌ها، مدارک، مالی و پیام‌ها را مدیریت کنید.</li>
          <li>تقویم جلسات و مهلت‌ها، گزارش و خروجی Excel/PDF را ببینید.</li>
        </ol>
        <div className="ds-note">وکیل: <b className="ltr">lawyer</b> · منشی (دسترسی محدودتر): <b className="ltr">assistant</b> — رمز هر دو <b className="ltr">Demo@1234</b></div>
        <Link href="/admin" className="btn ds-btn dark">ورود به پنل وکیل</Link>
      </section>
    </div>
    <p className="ds-foot"><b>یک آزمایش کامل:</b> در یک تب به‌عنوان موکل نوبت بگیرید، در تب دیگر به‌عنوان وکیل آن را تأیید کنید و نتیجه را در پنل موکل ببینید. · <Link href="/">بازگشت به سایت اصلی</Link></p>
  </div></div>;
}
