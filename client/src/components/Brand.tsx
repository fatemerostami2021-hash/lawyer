import { Link } from "wouter";
import AnimatedScaleMark from "./AnimatedScaleMark";
import WaveText from "./WaveText";
import { UI, type Locale } from "@/lib/i18n";

export default function Brand({ locale, footer = false }: { locale: Locale; footer?: boolean }) {
  return (
    <Link className={`brand-lockup${footer ? " footer-brand" : ""}`} href="/" aria-label={UI.brand[locale]}>
      <span className="brand-mark"><AnimatedScaleMark /><small>LAW</small></span>
      <span className="brand-name"><WaveText text={UI.brand[locale]} locale={locale} auto /></span>
    </Link>
  );
}
