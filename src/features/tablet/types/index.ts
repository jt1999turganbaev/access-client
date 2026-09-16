/* ---------- Backend: /api/tablet ---------- */

/** GET /rooms/list */
export interface Room {
  id: number;
  name: string;
  number: string;
}

export type TerminalDirection = 'in' | 'out';

/** GET /rooms/{id}/latest va SSE `access` hodisasi */
export interface AccessDisplay {
  event_id: number;
  captured_at: string;
  direction: TerminalDirection | null;
  granted: boolean;
  user: { id: number; full_name: string; photo: string | null } | null;
  /** Terminal tanimagan bo'lsa ham ismi kelishi mumkin */
  reported_name: string | null;
  task: { id: number; name: string; description: string | null } | null;
}

/* ---------- Klient (UI) ---------- */

export type TabletState = 'idle' | 'processing' | 'success' | 'denied' | 'not-found';

export interface TaskItem {
  id: string | number;
  title?: string | null;
  description?: string | null;
}

export interface RecognizedUser {
  id: string | number;
  fullName: string;
  /** Backend hozircha bermaydi — bo'lmasa card'da ko'rsatilmaydi */
  position?: string | null;
  photoUrl?: string | null;
  room: string;
  terminal: string;
  tasks: TaskItem[];
}

export type AccessStatus = 'granted' | 'denied' | 'not_found';

export interface AccessEvent {
  id: number;
  status: AccessStatus;
  /** not_found holatida user bo'lmaydi */
  user?: RecognizedUser | null;
  /** ISO datetime */
  occurredAt: string;
}
