import type { Locale } from "@/lib/i18n";

// Wave on hover. English: per letter. Persian/Arabic: per word (splitting Arabic-script letters would break their joining).
export default function WaveText({ text, locale }: { text: string; locale: Locale }) {
  const parts = locale === "en" ? Array.from(text) : text.split(" ");
  return (
    <span className="wave" aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} className="wave-p" style={{ ["--i" as string]: i } as React.CSSProperties} aria-hidden="true">
          {p === " " ? "\u00A0" : p}{locale !== "en" && i < parts.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
