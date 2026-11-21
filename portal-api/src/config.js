import 'dotenv/config';
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));
export const CFG = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-' + 'x'.repeat(24),
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim()),
  lawyerUser: process.env.LAWYER_USERNAME || 'lawyer',
  lawyerPass: process.env.LAWYER_PASSWORD || 'Demo@1234',
  assistantUser: process.env.ASSISTANT_USERNAME || 'assistant',
  assistantPass: process.env.ASSISTANT_PASSWORD || 'Demo@1234',
  tgToken: process.env.TELEGRAM_BOT_TOKEN || '',
  tgOwnerChat: process.env.TELEGRAM_OWNER_CHAT_ID || '',
  demoShowOtp: bool(process.env.DEMO_SHOW_OTP, true), // show the one-time code on screen (demo only)
  publicUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
  secureCookie: bool(process.env.COOKIE_SECURE, false),
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
};
