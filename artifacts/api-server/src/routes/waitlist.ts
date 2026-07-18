import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

function loadWaitlist(): { email: string; city?: string; ts: string }[] {
  try {
    fs.mkdirSync(path.dirname(WAITLIST_FILE), { recursive: true });
    if (!fs.existsSync(WAITLIST_FILE)) return [];
    return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveWaitlist(list: { email: string; city?: string; ts: string }[]) {
  fs.mkdirSync(path.dirname(WAITLIST_FILE), { recursive: true });
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// POST /api/waitlist  — add email to waitlist
router.post('/waitlist', (req, res) => {
  const { email, city } = req.body as { email?: string; city?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const list = loadWaitlist();

  // Deduplicate
  if (list.some(e => e.email.toLowerCase() === email.toLowerCase())) {
    return res.json({ ok: true, message: 'Already on the list', count: list.length });
  }

  list.push({ email: email.toLowerCase(), city: city?.trim() || undefined, ts: new Date().toISOString() });
  saveWaitlist(list);

  return res.json({ ok: true, message: "You're on the list!", count: list.length });
});

// GET /api/waitlist/count  — public count (no emails exposed)
router.get('/waitlist/count', (_req, res) => {
  const list = loadWaitlist();
  res.json({ count: list.length });
});

export default router;
