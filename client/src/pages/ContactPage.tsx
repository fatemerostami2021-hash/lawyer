import { useState, type FormEvent } from "react";
import { ArrowUpRight, Clock, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useLanguage } from "@/components/SiteChrome";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

const T: Record<string, Record<Locale, string>> = {
  kicker: { en: "Contact", fa: "تماس", ar: "تواصل" },
  title: { en: "Tell us what you are considering", fa: "بگویید به چه موضوعی فکر می‌کنید", ar: "أخبرنا بما تفكر فيه" },
  sub: { en: "Fill the short form — we reply using the details you give. Everything is confidential.", fa: "فرم کوتاه را پر کنید؛ با اطلاعاتی که می‌دهید پاسخ می‌دهیم. همه‌چیز محرمانه است.", ar: "املأ النموذج القصير؛ سنرد عليك بالبيانات التي تقدمها. كل شيء سري." },
  name: { en: "Your name", fa: "نام شما", ar: "اسمك" },
  contact: { en: "Email or phone", fa: "ایمیل یا شماره تماس", ar: "البريد أو الهاتف" },
  topic: { en: "Topic", fa: "موضوع", ar: "الموضوع" },
  brief: { en: "A short description", fa: "شرح کوتاه", ar: "وصف موجز" },
  briefPh: { en: "What would you like to discuss?", fa: "درباره چه موضوعی مایل به گفت‌وگو هستید؟", ar: "ما الذي تود مناقشته؟" },
  send: { en: "Request a consultation", fa: "درخواست مشاوره", ar: "طلب استشارة" },
  ok: { en: "Your request has been noted.", fa: "درخواست شما ثبت شد.", ar: "تم تسجيل طلبك." },
  okSub: { en: "We will be in touch using the details you provided.", fa: "به‌زودی با شما تماس می‌گیریم.", ar: "سنتواصل معك عبر البيانات التي قدمتها." },
  again: { en: "Send another request", fa: "ثبت درخواست دیگر", ar: "إرسال طلب آخر" },
  details: { en: "Direct contact", fa: "تماس مستقیم", ar: "تواصل مباشر" },
  hours: { en: "We reply within one working day", fa: "ظرف یک روز کاری پاسخ می‌دهیم", ar: "نرد خلال يوم عمل واحد" },
  conf: { en: "Confidential, direct and considered.", fa: "محرمانه، مستقیم و سنجیده.", ar: "سري ومباشر ومدروس." },
};

export default function ContactPage() {
  const { locale } = useLanguage(); const [sent, setSent] = useState(false);
  const t = (k: string) => T[k][locale];
  const topics = locale === "fa" ? ["تأسیس شرکت", "قرارداد", "سرمایه‌گذاری", "اختلاف و داوری", "برند", "سایر"] : locale === "ar" ? ["تأسيس شركة", "عقد", "استثمار", "نزاع وتحكيم", "علامة تجارية", "أخرى"] : ["Company formation", "Contract", "Investment", "Dispute & arbitration", "Brand", "Other"];
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setSent(true); };
  return <main className="route-page inner-page contact-page">
    <section className="contact-top page-width">
      <div className="contact-head"><span className="section-kicker">{t("kicker")}</span><h1>{t("title")}</h1><p>{t("sub")}</p></div>
      <div className="contact-layout">
        <div className="contact-form-wrap page-form" data-tilt>
          {sent ? <div className="form-success"><strong>{t("ok")}</strong><p>{t("okSub")}</p><button type="button" className="gold-link" onClick={() => setSent(false)}>{t("again")}</button></div> :
          <form onSubmit={submit} className="contact-form">
            <label><span>{t("name")}</span><input required name="name" autoComplete="name" /></label>
            <label><span>{t("contact")}</span><input required name="contact" placeholder="contact@example.com" /></label>
            <label><span>{t("topic")}</span><select name="topic">{topics.map(x => <option key={x}>{x}</option>)}</select></label>
            <label><span>{t("brief")}</span><textarea required name="brief" rows={5} placeholder={t("briefPh")} /></label>
            <button className="button button-gold" type="submit">{t("send")}<ArrowUpRight size={17} /></button>
            <small>{t("conf")}</small>
          </form>}
        </div>
        <aside className="contact-side">
          <figure className="side-photo"><div className="image-frame"><img src="/assets/photos/office.webp" alt="" loading="eager" /></div></figure>
          <div className="contact-info">
            <span className="section-kicker">{t("details")}</span>
            <a href={SITE.phoneHref}><Phone size={18} /><span dir="ltr">{SITE.phoneDisplay}</span></a>
            <a href={`mailto:${SITE.email}`}><Mail size={18} />{SITE.email}</a>
            <span><MapPin size={18} />{SITE.address}</span>
            <span><Clock size={18} />{t("hours")}</span>
            <div className="contact-page-social"><a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a><a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><Send /></a><a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a><a href={SITE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a></div>
          </div>
        </aside>
      </div>
    </section>
  </main>;
}
