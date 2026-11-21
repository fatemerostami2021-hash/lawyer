// Tiny JSON-file database: zero setup, data survives restarts (data/db.json).
// Same collection-style API as a Mongo repository, so it can be swapped for MongoDB Atlas later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'db.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

const COLLECTIONS = ['users', 'clients', 'cases', 'sessions', 'deadlines', 'appointments', 'documents', 'payments', 'messages', 'logs', 'otps', 'notes'];
let state = { meta: { seq: 1000, settings: null, telegram: { ownerChatId: null, offset: 0 } } };
COLLECTIONS.forEach(c => (state[c] = []));

if (fs.existsSync(FILE)) {
  try { state = { ...state, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; } catch (e) { console.error('db.json unreadable, starting fresh', e.message); }
}

let timer = null;
function persist() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, FILE);
  }, 150);
}
export function flush() { clearTimeout(timer); fs.writeFileSync(FILE, JSON.stringify(state)); }

export const nextId = (prefix = 'id') => `${prefix}_${++state.meta.seq}`;
export const meta = () => state.meta;
export const save = persist;
export const isEmpty = () => state.clients.length === 0 && state.users.length === 0;
export const reset = () => { COLLECTIONS.forEach(c => (state[c] = [])); persist(); };

export function col(name) {
  return {
    all: () => state[name],
    find: (fn = () => true) => state[name].filter(fn),
    get: id => state[name].find(x => x.id === id),
    one: fn => state[name].find(fn),
    insert(doc) { const d = { id: doc.id || nextId(name.slice(0, 3)), createdAt: new Date().toISOString(), ...doc }; if (!doc.id) d.id = d.id; state[name].push(d); persist(); return d; },
    update(id, patch) { const d = state[name].find(x => x.id === id); if (!d) return null; Object.assign(d, patch, { updatedAt: new Date().toISOString() }); persist(); return d; },
    remove(id) { const i = state[name].findIndex(x => x.id === id); if (i < 0) return false; state[name].splice(i, 1); persist(); return true; },
    removeWhere(fn) { const before = state[name].length; state[name] = state[name].filter(x => !fn(x)); persist(); return before - state[name].length; },
  };
}
