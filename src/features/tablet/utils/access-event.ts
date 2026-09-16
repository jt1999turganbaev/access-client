import {
  NOT_FOUND_TIMEOUT,
  READING_MS_PER_WORD,
  RESULT_TIMEOUT,
  RESULT_TIMEOUT_MAX,
  env,
} from '@/shared/config/env';
import type { AccessDisplay, AccessEvent, Room } from '@/features/tablet/types';

/**
 * Natija ekrani qancha turadi.
 * Vazifa matni uzun bo'lsa vaqt o'qishga yetadigan darajada uzayadi,
 * lekin RESULT_TIMEOUT_MAX dan oshmaydi.
 */
export function resultTimeout(event: Pick<AccessEvent, 'status' | 'user'>) {
  if (event.status === 'not_found') return NOT_FOUND_TIMEOUT;

  const text = (event.user?.tasks ?? [])
    .map((task) => `${task.title ?? ''} ${task.description ?? ''}`)
    .join(' ')
    .trim();
  if (!text) return RESULT_TIMEOUT;

  const words = text.split(/\s+/).length;
  return Math.min(RESULT_TIMEOUT + words * READING_MS_PER_WORD, RESULT_TIMEOUT_MAX);
}

export const roomLabel = (room: Room) =>
  [room.number, room.name].filter(Boolean).length === 2
    ? `${room.number} (${room.name})`
    : (room.number ?? room.name ?? '—');

const directionLabel = (direction: AccessDisplay['direction']) =>
  direction === 'in' ? 'Kirish' : direction === 'out' ? 'Chiqish' : '—';

export function resolvePhoto(photo: string | null | undefined) {
  if (!photo || typeof photo !== 'string') return null;
  if (/^(https?:|data:|blob:)/.test(photo)) return photo;
  try {
    return new URL(photo, env.backendOrigin).toString();
  } catch {
    // Noto'g'ri yo'l — rasmsiz ko'rsatamiz, ekran buzilmasin
    return null;
  }
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/**
 * Backend javobini UI modeliga o'giradi.
 * Har bir maydon yo'q yoki noto'g'ri turda bo'lishi mumkin deb hisoblanadi —
 * bunday hollarda ekran bo'sh joy bilan chiqadi, lekin buzilmaydi.
 */
export function toAccessEvent(display: AccessDisplay, room: Room | null): AccessEvent {
  const user = display.user && typeof display.user === 'object' ? display.user : null;
  const status = !user ? 'not_found' : display.granted ? 'granted' : 'denied';

  const task = display.task && typeof display.task === 'object' ? display.task : null;
  const taskTitle = text(task?.name);
  const taskDescription = text(task?.description);

  return {
    id: typeof display.event_id === 'number' ? display.event_id : 0,
    status,
    occurredAt: text(display.captured_at) ?? new Date().toISOString(),
    user: user
      ? {
          id: user.id ?? 0,
          // Ism kelmasa terminal aytgan nomga, u ham bo'lmasa chiziqchaga tushamiz
          fullName: text(user.full_name) ?? text(display.reported_name) ?? '—',
          photoUrl: resolvePhoto(user.photo),
          position: null,
          room: room ? roomLabel(room) : '—',
          terminal: directionLabel(display.direction),
          // Nomi ham, matni ham bo'sh vazifa ko'rsatilmaydi
          tasks:
            task && (taskTitle || taskDescription)
              ? [{ id: task.id ?? 0, title: taskTitle, description: taskDescription }]
              : [],
        }
      : null,
  };
}
