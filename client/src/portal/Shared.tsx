import { useEffect, useState } from "react";
import { api, useApi } from "./api";
import { addDays, fd, jd, today } from "./fmt";
import { Loading, Empty } from "./ui";

// Day chips + free time slots. Used by the client portal (booking) and the lawyer panel (manual booking / reschedule).
export function SlotPicker({ value, onChange, lockType }: { value: { type: string; date: string; time: string }; onChange: (v: { type: string; date: string; time: string }) => void; lockType?: boolean }) {
  const { data: cfg } = useApi<any>("/public/booking");
  const [slots, setSlots] = useState<string[] | null>(null);
  useEffect(() => { if (!value.date || !value.type) return; setSlots(null); api("/public/slots?date=" + value.date + "&type=" + value.type).then(r => setSlots(r.slots)).catch(() => setSlots([])); }, [value.date, value.type]);
  if (!cfg) return <Loading />;
  const types = Object.entries(cfg.types) as [string, any][];
  if (!cfg.open || !types.length) return <Empty>در حال حاضر نوبت‌دهی آنلاین فعال نیست. لطفاً با دفتر تماس بگیرید.</Empty>;
  const days = Array.from({ length: Math.min(cfg.maxAdvanceDays, 21) + 1 }, (_, i) => addDays(today(), i));
  return <div>
    {!lockType && <div className="grid g3 mb">{types.map(([k, t]) => <button type="button" key={k} className={"typecard" + (value.type === k ? " on" : "")} onClick={() => onChange({ type: k, date: value.date, time: "" })}><b>{t.label}</b><div className="small muted">{fd(t.duration)} دقیقه · {fd(Number(t.price).toLocaleString("en-US"))} تومان</div><div className="small muted">{t.note}</div></button>)}</div>}
    <div className="field"><label>روز</label><div className="row" style={{ flexWrap: "nowrap", overflow: "auto", paddingBottom: 6 }}>{days.map(d => <button type="button" key={d} className={"slot" + (value.date === d ? " on" : "")} style={{ minWidth: 96, flex: "none", padding: "8px 6px" }} onClick={() => onChange({ ...value, date: d, time: "" })}>{jd(d, "day")}</button>)}</div></div>
    <div className="field"><label>ساعت</label>
      {!value.type ? <p className="muted small">ابتدا نوع مشاوره را انتخاب کنید.</p> : !value.date ? <p className="muted small">یک روز را انتخاب کنید.</p> : slots === null ? <Loading /> : slots.length === 0 ? <p className="muted small">در این روز زمان خالی وجود ندارد (روز تعطیل یا پر است). روز دیگری انتخاب کنید.</p> :
        <div className="slotgrid">{slots.map(s => <button type="button" key={s} className={"slot" + (value.time === s ? " on" : "")} onClick={() => onChange({ ...value, time: s })}>{fd(s)}</button>)}</div>}
    </div>
  </div>;
}
