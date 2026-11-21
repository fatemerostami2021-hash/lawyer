import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';
import { CFG } from './config.js';
import { col } from './db.js';

const key = new TextEncoder().encode(CFG.jwtSecret);
const COOKIE = 'sn_session';

export async function issue(res, payload, days = 7) {
  const token = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${days}d`).sign(key);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: CFG.cookieSameSite, secure: CFG.secureCookie, maxAge: days * 864e5, path: '/' });
}
export const clear = res => res.clearCookie(COOKIE, { path: '/' });

export async function attachUser(req, _res, next) {
  const t = req.cookies?.[COOKIE];
  if (t) { try { const { payload } = await jwtVerify(t, key); req.auth = payload; } catch { /* expired */ } }
  next();
}
export const requireAuth = (...roles) => (req, res, next) => {
  if (!req.auth) return res.status(401).json({ error: 'نیاز به ورود دارید' });
  if (roles.length && !roles.includes(req.auth.role)) return res.status(403).json({ error: 'دسترسی ندارید' });
  next();
};
export const staff = requireAuth('lawyer', 'assistant');
export const lawyerOnly = requireAuth('lawyer');
export const clientOnly = requireAuth('client');

export const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

export function log(req, action, detail = '', actor) {
  const a = actor || (req?.auth ? { id: req.auth.sub, name: req.auth.name, role: req.auth.role } : { id: null, name: 'سیستم', role: 'system' });
  col('logs').insert({ actorId: a.id, actorName: a.name, role: a.role, action, detail, ip: req?.ip || '' });
}
