import { useEffect, useState } from "react";
import { api, useApi } from "./api";
import { addDays, fd, jalaliMonth, jd, today } from "./fmt";
import { Empty, Loading } from "./ui";

const WEEK = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// Month calendar (Jalali) + free time slots. Used by the client portal (booking) and the lawyer panel (manual booking / reschedule).
export function SlotPicker({ value, onChange, lockType }: { value: { type: string; date: string; time: string }; onChange: (v: { type: string; date: string; time: string }) => void; lockType?: boolean }) {
  const { data: cfg } = useApi<any>("/public/booking");
  const [ref, setRef] = useState(today());
  const [avail, setAvail] = useState<Record<string, number> | null>({});
  const [slots, setSlots] = useState<string[] | null>(null);
  const m = jalaliMonth(ref);
  useEffect(() => {
    if (!value.type) { setAvail({}); return; }
    let live = true; setAvail(null);
    api(`/public/availability?type=${value.type}&from=${m.first}&to=${addDays(m.next, -1)}`).then(r => live && setAvail(r.days)).catch(() => live && setAvail({}));
    return () => { live = false; };
  }, [value.type, m.first, m.next]);
  useEffect(() => { if (!value.date || !value.type) return; setSlots(null); api("/public/slots?date=" + value.date + "&type=" + value.type).then(r => setSlots(r.slots)).catch(() => setSlots([])); }, [value.date, value.type]);
  if (!cfg) return <Loading />;
  const types = Object.entries(cfg.types) as [string, any][];
  if (!cfg.open || !types.length) return <Empty>در حال حاضر نوبت‌دهی آنلاین فعال نیست. لطفاً با دفتر تماس بگیرید.</Empty>;
  const canPrev = m.first > today(), canNext = m.next <= addDays(today(), cfg.maxAdvanceDays);
  return <div>
    {!lockType && <div className="grid g3 mb">{types.map(([k, t]) => <button type="button" key={k} className={"typecard" + (value.type === k ? " on" : "")} onClick={() => onChange({ type: k, date: "", time: "" })}><b>{t.label}</b><div className="small muted">{fd(t.duration)} دقیقه · {fd(Number(t.price).toLocaleString("en-US"))} تومان</div><div className="small muted">{t.note}</div></button>)}</div>}
    <div className="grid g2" style={{ alignItems: "start" }}>
      <div className="card" style={{ padding: 14 }}>
        <div className="row sb mb">
          <button type="button" className="btn ghost sm" disabled={!canNext} onClick={() => setRef(m.next)} aria-label="ماه بعد">‹</button>
          <b style={{ fontSize: 16 }}>{m.title}</b>
          <button type="button" className="btn ghost sm" disabled={!canPrev} onClick={() => setRef(m.prev)} aria-label="ماه قبل">›</button>
        </div>
        <div className="mcal">{WEEK.map(w => <div key={w} className="h small muted" style={{ textAlign: "center", fontWeight: 700 }}>{w}</div>)}
          {m.cells.map((c, i) => { if (!c) return <div key={i} />; const n = avail?.[c.date] || 0; const sel = value.date === c.date;
            return <button type="button" key={i} disabled={!n} className={"mc" + (n ? " ok" : "") + (sel ? " sel" : "") + (c.date === today() ? " today" : "")} onClick={() => onChange({ ...value, date: c.date, time: "" })} aria-label={jd(c.date, "long")}>{fd(c.day)}{n > 0 && <i>{fd(n)} نوبت</i>}</button>; })}
        </div>
        <div className="small muted mt">{!value.type ? "ابتدا نوع مشاوره را انتخاب کنید." : avail === null ? "در حال بررسی روزهای خالی…" : "روزهای طلایی‌رنگ نوبت خالی دارند. یک روز را انتخاب کنید."}</div>
      </div>
      <div className="card" style={{ padding: 14 }}>
        <div className="b mb">{value.date ? "ساعت‌های خالی — " + jd(value.date, "long") : "ساعت‌های خالی"}</div>
        {!value.date ? <p className="muted small">پس از انتخاب روز، ساعت‌ها اینجا نمایش داده می‌شود.</p> : slots === null ? <Loading /> : slots.length === 0 ? <p className="muted small">در این روز زمان خالی وجود ندارد. روز دیگری انتخاب کنید.</p> :
          <div className="slotgrid">{slots.map(s => <button type="button" key={s} className={"slot" + (value.time === s ? " on" : "")} onClick={() => onChange({ ...value, time: s })}>{fd(s)}</button>)}</div>}
      </div>
    </div>
  </div>;
}
