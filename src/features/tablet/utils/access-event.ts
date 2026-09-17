import {
  EXIT_SUCCESS_TIMEOUT,
  GREETING_MAX_AUDIO,
  GREETING_TAIL_TIMEOUT,
  NOT_FOUND_TIMEOUT,
  READING_MS_PER_WORD,
  RESULT_TIMEOUT,
  RESULT_TIMEOUT_MAX,
  env,
} from '@/shared/config/env';
import type { AccessDisplay, AccessEvent, Room } from '@/features/tablet/types';
import { i18n } from '@/shared/config/i18n';

/**
 * Kirishdagi success ekrani qancha turadi.
 *
 * Salomlashuv ovozining aniq uzunligi ma'lum bo'lsa — shunga qarab.
 * Ma'lum bo'lmasa — salomlashuv va vazifani aytishga yetadigan taxminiy vaqtga qarab.
 * Har qanday holatda kamida RESULT_TIMEOUT, ustiga GREETING_TAIL_TIMEOUT qo'shiladi.
 */
export function greetingScreenTimeout(
  event: Pick<AccessEvent, 'status' | 'user' | 'direction'>,
  audioMs?: number | null,
) {
  // `Infinity`, `NaN`, manfiy yoki haddan ziyod katta qiymat — ishonchsiz, taxminiy vaqtga tushamiz
  const known =
    typeof audioMs === 'number' &&
    Number.isFinite(audioMs) &&
    audioMs > 0 &&
    audioMs <= GREETING_MAX_AUDIO;
  const base = known ? audioMs : resultTimeout(event);
  // Zaxira vaqt ham buzuq bo'lib qolmasin
  const safeBase = Number.isFinite(base) && base > 0 ? base : RESULT_TIMEOUT;
  return Math.round(Math.max(safeBase, RESULT_TIMEOUT) + GREETING_TAIL_TIMEOUT);
}

/**
 * Ekran (har qanday natija) qancha turadi.
 * Kirishdagi success salomlashuvga qarab, qolganlari belgilangan vaqtga qarab.
 */
export function screenTimeout(
  event: Pick<AccessEvent, 'status' | 'user' | 'direction'>,
  audioMs?: number | null,
) {
  const isEntrySuccess = event.status === 'granted' && !isExitSuccess(event);
  return isEntrySuccess ? greetingScreenTimeout(event, audioMs) : resultTimeout(event);
}

/** Chiqishda ruxsat — success ekrani ham vaqt tugagach bosh sahifaga qaytadi */
export const isExitSuccess = (event: Pick<AccessEvent, 'status' | 'direction'>) =>
  event.status === 'granted' && event.direction === 'out';

/**
 * Natija ekrani qancha turadi.
 * Vazifa matni uzun bo'lsa vaqt o'qishga yetadigan darajada uzayadi,
 * lekin RESULT_TIMEOUT_MAX dan oshmaydi.
 */
export function resultTimeout(event: Pick<AccessEvent, 'status' | 'user' | 'direction'>) {
  if (event.status === 'not_found') return NOT_FOUND_TIMEOUT;
  if (isExitSuccess(event)) return EXIT_SUCCESS_TIMEOUT;

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
  direction === 'in' || direction === 'out' ? i18n.t(`direction.${direction}`) : '—';

/** Rasm/audio yo'li nisbiy kelsa backend manziliga bog'lanadi */
export function resolveMediaUrl(path: string | null | undefined) {
  if (!path || typeof path !== 'string') return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  try {
    return new URL(path, env.backendOrigin).toString();
  } catch {
    // Noto'g'ri yo'l — faylsiz ko'rsatamiz, ekran buzilmasin
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
    direction: display.direction === 'in' || display.direction === 'out' ? display.direction : null,
    greetingAudioUrl: resolveMediaUrl(text(display.greeting_audio_url)),
    user: user
      ? {
          id: user.id ?? 0,
          // Ism kelmasa terminal aytgan nomga, u ham bo'lmasa chiziqchaga tushamiz
          fullName: text(user.full_name) ?? text(display.reported_name) ?? '—',
          photoUrl: resolveMediaUrl(user.photo),
          role: typeof user.role === 'string' ? user.role : null,
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
