import { CFG } from './config.js';
import { col, meta, save } from './db.js';
import { esc, fa, faDigits, nextFreeSlots, todayStr, getSettings, money, nowTehran, toMin } from './util.js';

const API = () => `${process.env.TG_API_BASE || 'https://api.telegram.org'}/bot${CFG.tgToken}`;
export const tgEnabled = () => !!CFG.tgToken;
export const ownerChat = () => CFG.tgOwnerChat || meta().telegram.ownerChatId;
let botName = null;
export const tgInfo = () => ({ enabled: tgEnabled(), paired: !!ownerChat(), botName });

async function call(method, body) {
  if (!tgEnabled()) return null;
  try {
    const r = await fetch(`${API()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const j = await r.json();
    if (!j.ok) console.error('[telegram]', method, j.description);
    return j;
  } catch (e) { console.error('[telegram] network error:', e.message); return null; }
}
export async function sendOwner(text, buttons) {
  const chat = ownerChat();
  if (!tgEnabled() || !chat) { console.log('[telegram] (not sent: bot not paired yet)', text.replace(/<[^>]+>/g, '').slice(0, 80)); return null; }
  return call('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}) });
}

export const apptText = (a, c) => [
  `📅 <b>درخواست نوبت جدید</b>`,
  `👤 ${esc(c?.name || a.name)}  |  📱 ${faDigits(a.mobile || c?.mobile || '')}`,
  `🏷 نوع: ${esc(getSettings().types[a.type]?.label || a.type)}  |  ⏱ ${faDigits(a.duration)} دقیقه`,
  `🗓 ${fa(a.date)} — ساعت ${faDigits(a.time)}`,
  a.topic ? `📝 موضوع: ${esc(a.topic)}` : '',
  a.status === 'confirmed' ? '✅ تأیید شده' : a.status === 'rejected' ? '❌ رد شده' : a.status === 'rescheduled' ? '🕐 زمان دیگری پیشنهاد شد' : '⏳ در انتظار تصمیم شما',
].filter(Boolean).join('\n');
const apptButtons = a => [[{ text: '✅ تأیید', callback_data: `ap:ok:${a.id}` }, { text: '❌ رد', callback_data: `ap:no:${a.id}` }], [{ text: '🕐 پیشنهاد زمان دیگر', callback_data: `ap:re:${a.id}` }]];

export async function notifyNewAppointment(a) {
  const c = col('clients').get(a.clientId);
  const r = await sendOwner(apptText(a, c), a.status === 'pending' ? apptButtons(a) : undefined);
  if (r?.ok) col('appointments').update(a.id, { tgMessageId: r.result.message_id });
}

export function applyDecision(id, decision, by = 'تلگرام', extra = {}) {
  const a = col('appointments').get(id);
  if (!a) return { error: 'نوبت پیدا نشد' };
  const s = getSettings();
  let patch, msg;
  if (decision === 'ok') { patch = { status: 'confirmed', decidedBy: by, decidedAt: new Date().toISOString(), meetLink: a.type === 'online' ? (s.types.online.link || '') : '' }; msg = `✅ نوبت شما برای ${fa(a.date)} ساعت ${faDigits(a.time)} (${s.types[a.type]?.label}) تأیید شد.${a.type === 'online' ? ' لینک جلسه در بخش نوبت‌ها قابل مشاهده است.' : ''}`; }
  else if (decision === 'no') { patch = { status: 'rejected', decidedBy: by, decidedAt: new Date().toISOString(), reason: extra.reason || '' }; msg = `متأسفانه درخواست نوبت شما برای ${fa(a.date)} ساعت ${faDigits(a.time)} در این زمان امکان‌پذیر نیست.${extra.reason ? ' توضیح: ' + extra.reason : ''} لطفاً زمان دیگری را انتخاب کنید.`; }
  else if (decision === 'resched') { patch = { status: 'rescheduled', decidedBy: by, proposed: { date: extra.date, time: extra.time } }; msg = `زمان پیشنهادی وکیل: ${fa(extra.date)} ساعت ${faDigits(extra.time)}. لطفاً در بخش نوبت‌ها تأیید یا رد کنید.`; }
  else return { error: 'نامعتبر' };
  const upd = col('appointments').update(id, patch);
  col('messages').insert({ clientId: a.clientId, from: 'office', text: msg, read: false, kind: 'appointment', apptId: id });
  return { appt: upd, msg };
}

async function answer(cbId, text) { await call('answerCallbackQuery', { callback_query_id: cbId, text }); }

async function onCallback(q) {
  const chat = String(q.message?.chat?.id);
  if (chat !== String(ownerChat())) return answer(q.id, 'شما مجاز نیستید');
  const [ns, act, id, ...rest] = q.data.split(':'); const extra = rest.join(':');
  if (ns !== 'ap') return answer(q.id);
  const a = col('appointments').get(id);
  if (!a) return answer(q.id, 'نوبت پیدا نشد');
  const c = col('clients').get(a.clientId);
  const edit = (text, kb) => call('editMessageText', { chat_id: chat, message_id: q.message.message_id, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: kb || [] } });
  if (act === 're') {
    const slots = nextFreeSlots(a.type, 4, todayStr(), a.id);
    if (!slots.length) return answer(q.id, 'زمان خالی پیدا نشد');
    const kb = slots.map(s => [{ text: `${fa(s.date, { weekday: 'short', day: 'numeric', month: 'long' })} — ${faDigits(s.time)}`, callback_data: `ap:sl:${id}:${s.date}T${s.time}` }]);
    kb.push([{ text: '↩️ بازگشت', callback_data: `ap:bk:${id}` }]);
    await edit(apptText(a, c) + '\n\n<b>یکی از زمان‌های خالی را پیشنهاد دهید:</b>', kb); return answer(q.id);
  }
  if (act === 'bk') { await edit(apptText(a, c), a.status === 'pending' ? apptButtons(a) : []); return answer(q.id); }
  if (act === 'sl') { const [date, time] = extra.split('T'); const r = applyDecision(id, 'resched', 'تلگرام', { date, time }); await edit(apptText(r.appt, c)); return answer(q.id, 'پیشنهاد برای موکل ارسال شد'); }
  if (act === 'ok' || act === 'no') { const r = applyDecision(id, act, 'تلگرام'); await edit(apptText(r.appt, c)); return answer(q.id, act === 'ok' ? 'تأیید شد ✅' : 'رد شد'); }
  return answer(q.id);
}

const agendaToday = () => {
  const d = todayStr();
  const apps = col('appointments').find(a => a.date === d && a.status === 'confirmed').sort((x, y) => x.time.localeCompare(y.time));
  const ses = col('sessions').find(s => s.date === d).sort((x, y) => (x.time || '').localeCompare(y.time || ''));
  const lines = [`📆 <b>برنامه امروز — ${fa(d)}</b>`];
  if (!apps.length && !ses.length) lines.push('برنامه‌ای برای امروز ثبت نشده.');
  apps.forEach(a => lines.push(`🤝 ${faDigits(a.time)} — ${esc(col('clients').get(a.clientId)?.name)} (${esc(getSettings().types[a.type]?.label)})`));
  ses.forEach(s => lines.push(`⚖️ ${faDigits(s.time || '--')} — ${esc(s.court)} | ${esc(col('cases').get(s.caseId)?.title || '')}`));
  return lines.join('\n');
};

async function onMessage(m) {
  const chat = String(m.chat.id), text = (m.text || '').trim();
  const owner = ownerChat();
  if (text.startsWith('/start')) {
    if (!owner) { meta().telegram.ownerChatId = chat; save(); await call('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '✅ <b>اتصال برقرار شد.</b>\nاز این پس درخواست نوبت و پیام‌های موکلان اینجا می‌آید و می‌توانید با دکمه‌ها مدیریتشان کنید.\n\nدستورها: /today برنامه امروز  |  /pending نوبت‌های در انتظار  |  /stats آمار' }); return; }
    if (String(owner) !== chat) return void call('sendMessage', { chat_id: chat, text: 'این ربات اختصاصی دفتر وکالت است و برای شما فعال نیست.' });
    return void call('sendMessage', { chat_id: chat, text: 'ربات فعال است ✅\n/today  /pending  /stats' });
  }
  if (String(owner) !== chat) return;
  if (text === '/today') return void call('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: agendaToday() });
  if (text === '/pending') {
    const p = col('appointments').find(a => a.status === 'pending');
    if (!p.length) return void call('sendMessage', { chat_id: chat, text: 'نوبت در انتظاری وجود ندارد 👌' });
    for (const a of p) await sendOwner(apptText(a, col('clients').get(a.clientId)), apptButtons(a));
    return;
  }
  if (text === '/stats') {
    const inv = col('payments').all(); const due = inv.reduce((s, p) => s + (p.amount - (p.paid || 0)), 0);
    return void call('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: `📊 <b>آمار</b>\nموکلان: ${faDigits(col('clients').all().length)}\nپرونده‌های فعال: ${faDigits(col('cases').find(c => c.status !== 'closed').length)}\nنوبت‌های در انتظار: ${faDigits(col('appointments').find(a => a.status === 'pending').length)}\nمطالبات معوق: ${money(due)}` });
  }
}

let running = false;
export async function startBot() {
  if (!tgEnabled() || running) return;
  running = true;
  const me = await call('getMe');
  if (me?.ok) { botName = me.result.username; console.log(`[telegram] bot @${botName} ready — ${ownerChat() ? 'paired ✅' : 'send /start to it to pair'}`); } else { console.error('[telegram] cannot reach Telegram (token wrong, or VPN is off — Telegram is filtered in Iran). Retrying in 15s…'); running = false; setTimeout(startBot, 15000).unref?.(); return; }
  await call('deleteWebhook'); // polling mode (works on localhost, no public URL needed)
  (async function loop() {
    while (running) {
      const r = await call('getUpdates', { offset: meta().telegram.offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
      if (!r?.ok) { await new Promise(res => setTimeout(res, 5000)); continue; }
      for (const u of r.result) {
        meta().telegram.offset = u.update_id + 1; save();
        try { if (u.callback_query) await onCallback(u.callback_query); else if (u.message) await onMessage(u.message); } catch (e) { console.error('[telegram] handler error', e); }
      }
    }
  })();
  // reminders: confirmed appointment in the next hour, once
  setInterval(() => {
    const n = nowTehran();
    col('appointments').find(a => a.status === 'confirmed' && a.date === n.date && !a.reminded && toMin(a.time) - toMin(n.time) <= 60 && toMin(a.time) - toMin(n.time) >= 0).forEach(a => {
      col('appointments').update(a.id, { reminded: true });
      sendOwner(`⏰ <b>یادآوری:</b> ${faDigits(a.time)} نوبت ${esc(getSettings().types[a.type]?.label)} با ${esc(col('clients').get(a.clientId)?.name)}`);
    });
  }, 60000).unref();
}
