import type { AccessDisplay } from '@/features/tablet/types';
import { storage } from '@/shared/lib';

/** DevTools'da: JSON.parse(localStorage.getItem('tablet-access-debug')) */
const KEY = 'tablet-access-debug';
const LIMIT = 50;

interface DebugEntry {
  /** Hodisa qayerdan keldi */
  source: 'sse' | 'latest';
  /** Planshet soati bo'yicha qabul qilingan vaqt */
  receivedAt: string;
  event_id: number;
  captured_at: string;
  direction: AccessDisplay['direction'];
  /** Backend yuborgan xom qiymat — turi bilan */
  granted: unknown;
  user_id: number | null;
  full_name: string | null;
}

/**
 * Kelgan har bir `access` hodisasini (rasmsiz) planshet xotirasida oxirgi LIMIT tagacha saqlaydi.
 * Kutilmagan ekran chiqsa, aynan qaysi ma'lumot kelganini keyin tekshirish uchun.
 */
export function logAccessEvent(source: DebugEntry['source'], display: AccessDisplay) {
  const entry: DebugEntry = {
    source,
    receivedAt: new Date().toISOString(),
    event_id: display.event_id,
    captured_at: display.captured_at,
    direction: display.direction,
    granted: display.granted,
    user_id: display.user?.id ?? null,
    full_name: display.user?.full_name ?? null,
  };
  const entries = storage.getJson<DebugEntry[]>(KEY);
  const next = [...(Array.isArray(entries) ? entries : []), entry].slice(-LIMIT);
  storage.setJson(KEY, next);
  if (display.granted !== true) console.info('[access] granted !== true', entry);
}
