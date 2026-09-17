import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import dayjs from 'dayjs';
import { tabletApi } from '@/features/tablet/api/tablet-api';
import { screenTimeout, toAccessEvent } from '@/features/tablet/utils/access-event';
import { logAccessEvent } from '@/features/tablet/utils/access-debug-log';
import { STREAM_PING_TIMEOUT, STREAM_RETRY_DELAY } from '@/shared/config/env';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import type { AccessDisplay, AccessEvent } from '@/features/tablet/types';

/** Ulanish shu vaqtdan uzoq yashasa — rejali yopilish deb hisoblanadi */
const STABLE_AFTER = 5_000;

/**
 * Aloqa shundan uzoq yo'q bo'lgan bo'lsa — haqiqiy uzilish. Rejali qayta ulanish va
 * bir necha soniyalik kechikish bunga kirmaydi (ms).
 */
const OUTAGE_AFTER = 10_000;
/** Uzilishdan keyin kelgan eski hodisalar shu vaqt ichida yig'iladi (ms) */
const BACKLOG_WINDOW = 1_000;
/** Yig'ish hodisa kelgan sari uzayadi, lekin shundan oshmaydi (ms) */
const BACKLOG_WINDOW_MAX = 3_000;
/** Aloqa tiklangach eski hodisalar shu vaqt ichida kutiladi; keyin hammasi jonli deb qaraladi (ms) */
const BACKLOG_ARM_TIMEOUT = 10_000;
/** Shundan yangi hodisa jonli deb hisoblanadi — odam hali terminal oldida (ms) */
const LIVE_EVENT_AGE = 3_000;

/**
 * Xonadagi identifikatsiyalarni tinglaydi:
 * 1) GET /rooms/{id}/latest — oxirgi event id (yaqinda bo'lgan bo'lsa ekranga tiklanadi)
 * 2) GET /rooms/{id}/stream — SSE: `access` (identifikatsiya) va `ping` (har ~15s, tiriklik belgisi)
 *
 * Uzilishda o'zimiz qayta ulanamiz va `after_event_id` yuboramiz — hech narsa o'tkazib yuborilmaydi.
 * `ping` kelmay qolsa (tarmoq jim uzilgan bo'lsa) ulanish majburan qayta ochiladi.
 */
export function useAccessEvents() {
  const { room, deviceId, handleEvent, showResult, setConnected, clearRoom } = useTablet();

  // Handler'lar o'zgarsa ham ulanish qayta ochilmasligi uchun ref'da saqlanadi
  const handlers = useRef({ handleEvent, showResult, setConnected, clearRoom });
  handlers.current = { handleEvent, showResult, setConnected, clearRoom };

  // Til o'zgarsa oqim yangi `locale` bilan qayta ochiladi
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  // Qayta ulanishda (til o'zgarganda) shu xonaning oxirgi hodisasi eslab qolinadi —
  // ko'rsatilgan natija qayta chiqmaydi va hech narsa o'tkazib yuborilmaydi
  const lastEvent = useRef<{ roomId: number; id: number } | null>(null);

  useEffect(() => {
    if (!room) return;

    let disposed = false;
    let source: EventSource | null = null;
    let retryTimer: number | null = null;
    let watchdog: number | null = null;
    let lastEventId: number | null =
      lastEvent.current?.roomId === room.id ? lastEvent.current.id : null;
    let failures = 0;

    const rememberEvent = (id: number) => {
      lastEventId = id;
      lastEvent.current = { roomId: room.id, id };
    };

    /** Aloqa qachondan beri yo'q — birinchi uzilishda qo'yiladi, aloqa tiklanganda tozalanadi */
    let offlineSince: number | null = null;
    /** Uzilishdan keyin eski hodisalar shu vaqtgacha kutiladi (0 — kutilmaydi) */
    let backlogArmedUntil = 0;
    /** Yig'ish oynasi: 0 — yig'ish yo'q, aks holda oyna tugash vaqti */
    let backlogUntil = 0;
    let backlogPending: AccessDisplay | null = null;
    let backlogTimer: number | null = null;

    const clearTimers = () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      if (watchdog) window.clearTimeout(watchdog);
      retryTimer = null;
      watchdog = null;
    };

    const clearBacklog = () => {
      if (backlogTimer) window.clearTimeout(backlogTimer);
      backlogTimer = null;
      backlogUntil = 0;
      backlogArmedUntil = 0;
      backlogPending = null;
    };

    const show = (display: AccessDisplay) => {
      // Ovoz handleEvent ichida ijro etiladi — faqat jonli hodisada,
      // sahifa qayta ochilganda tiklangan eski hodisa ovoz chiqarmaydi
      handlers.current.handleEvent(toAccessEvent(display, room));
    };

    /**
     * O'tmishdagi hodisadan qancha vaqt qolgan (ms). Vaqti tugagan bo'lsa — `null`,
     * ya'ni hodisa ekranda umuman ko'rsatilmaydi.
     */
    const remainingFor = (display: AccessDisplay, event: AccessEvent) => {
      const timeout = screenTimeout(event);
      // Terminal soati oldinda bo'lsa yosh manfiy chiqadi — hodisa yangi deb hisoblanadi
      const age = Math.max(dayjs().diff(dayjs(display.captured_at)), 0);
      return age < timeout ? timeout - age : null;
    };

    /**
     * Oyna tugadi: uzilish paytidagi hodisalardan faqat eng oxirgisi, u ham vaqti
     * o'tmagan bo'lsa ko'rsatiladi. Odam allaqachon ketgan bo'lsa ekran ham, ovoz ham yo'q.
     */
    const flushBacklog = () => {
      backlogTimer = null;
      backlogUntil = 0;
      backlogArmedUntil = 0;
      const display = backlogPending;
      backlogPending = null;
      if (!display || disposed) return;

      // Hozirgina bo'lgan hodisa — odam hali turibdi, odatdagidek (ovoz bilan) ko'rsatiladi
      const age = Math.max(dayjs().diff(dayjs(display.captured_at)), 0);
      if (age < LIVE_EVENT_AGE) {
        show(display);
        return;
      }

      const event = toAccessEvent(display, room);
      const remaining = remainingFor(display, event);
      if (remaining != null) handlers.current.showResult(event, remaining);
    };

    const scheduleBacklogFlush = () => {
      if (backlogTimer) window.clearTimeout(backlogTimer);
      // Hodisa kelgan sari oyna uzayadi, lekin BACKLOG_WINDOW_MAX dan oshmaydi
      const at = Math.min(Date.now() + BACKLOG_WINDOW, backlogUntil);
      backlogTimer = window.setTimeout(flushBacklog, Math.max(at - Date.now(), 0));
    };

    const onAccess = (message: MessageEvent<string>) => {
      let display: AccessDisplay;
      try {
        const parsed = JSON.parse(message.data);
        display = parsed?.data ?? parsed;
      } catch {
        return;
      }
      if (typeof display?.event_id !== 'number') return;
      if (lastEventId != null && display.event_id <= lastEventId) return;

      rememberEvent(display.event_id);
      logAccessEvent('sse', display);

      // Uzilishdan keyingi eski hodisalar ketma-ket ekranda chaqnamasligi uchun yig'iladi
      if (backlogUntil > 0 || (backlogArmedUntil > 0 && Date.now() < backlogArmedUntil)) {
        // Oyna birinchi hodisa kelganda ochiladi — oqim kech yetib kelsa ham ishlaydi
        if (backlogUntil === 0) backlogUntil = Date.now() + BACKLOG_WINDOW_MAX;
        backlogPending = display;
        scheduleBacklogFlush();
        return;
      }
      backlogArmedUntil = 0;
      show(display);
    };

    const connect = () => {
      if (disposed) return;
      const startedAt = Date.now();

      const current = new EventSource(tabletApi.streamUrl(room.id, lastEventId, deviceId));
      source = current;

      /** Har bir xabar oqim tirikligini tasdiqlaydi; ping kelmay qolsa — qayta ulanamiz */
      const alive = () => {
        if (source !== current) return;
        failures = 0;
        handlers.current.setConnected(true);

        // Aloqa tiklandi. Uzoq uzilishdan keyin server eski hodisalarni yuboradi —
        // ular yig'ilib, faqat oxirgisi ko'rsatiladi. Qisqa uzilishda hammasi odatdagidek.
        if (offlineSince != null) {
          if (Date.now() - offlineSince > OUTAGE_AFTER) {
            backlogArmedUntil = Date.now() + BACKLOG_ARM_TIMEOUT;
          }
          offlineSince = null;
        }
        if (watchdog) window.clearTimeout(watchdog);
        watchdog = window.setTimeout(() => {
          if (source !== current) return;
          current.close();
          // `ping` kelmay qolgan — aloqa allaqachon uzilgan, uzilish shundan hisoblanadi
          offlineSince = Date.now() - STREAM_PING_TIMEOUT;
          handlers.current.setConnected(false);
          connect();
        }, STREAM_PING_TIMEOUT);
      };

      current.onopen = alive;
      // `ping` — serverning har ~15 soniyalik tiriklik signali
      current.addEventListener('ping', alive as EventListener);
      current.addEventListener('access', ((message: MessageEvent<string>) => {
        alive();
        onAccess(message);
      }) as EventListener);

      current.onerror = () => {
        // Server `max_seconds` dan keyin yopadi yoki tarmoq uzildi. Brauzerning
        // avto-reconnect'i eski URL bilan ulanadi — shuning uchun o'zimiz boshqaramiz.
        current.close();
        clearTimers();
        // Faqat birinchi uzilishda qo'yiladi — har bir muvaffaqiyatsiz urinish
        // uzilish vaqtini nolga qaytarib yubormasligi kerak
        if (offlineSince == null) offlineSince = Date.now();

        const lived = Date.now() - startedAt;
        if (lived < STABLE_AFTER) {
          failures += 1;
          // Bir marta uzilish rejali bo'lishi mumkin, ketma-ket uzilish — haqiqiy muammo
          if (failures >= 2) handlers.current.setConnected(false);
          retryTimer = window.setTimeout(connect, STREAM_RETRY_DELAY);
        } else {
          failures = 0;
          retryTimer = window.setTimeout(connect, 300);
        }
      };
    };

    const start = async () => {
      try {
        const latest = await tabletApi.getLatest(room.id);
        if (disposed) return;
        // Bu hodisa allaqachon ko'rsatilgan bo'lsa (qayta ulanish) — tiklanmaydi
        if (latest && (lastEventId == null || latest.event_id > lastEventId)) {
          rememberEvent(latest.event_id);
          logAccessEvent('latest', latest);
          const event = toAccessEvent(latest, room);
          // Ovoz tiklanmaydi, shuning uchun uzunligi ham yo'q — taxminiy vaqt ishlatiladi
          const remaining = remainingFor(latest, event);
          if (remaining != null) handlers.current.showResult(event, remaining);
        }
      } catch (error) {
        if (disposed) return;
        // Xona serverda topilmadi (o'chirilgan) — cheksiz urinmasdan
        // biriktirishni bekor qilamiz, planshet xona tanlashni so'raydi
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          handlers.current.clearRoom();
          return;
        }
        /* boshqa xatolarda oqimga baribir ulanamiz */
      }
      connect();
    };

    start();

    return () => {
      disposed = true;
      clearTimers();
      // Yig'ilgan hodisa ko'rsatilmay qoldi — keyingi ulanish uni qayta olib kelsin
      if (backlogPending) lastEvent.current = { roomId: room.id, id: backlogPending.event_id - 1 };
      clearBacklog();
      source?.close();
      handlers.current.setConnected(false);
    };
  }, [room, deviceId, language]);
}
