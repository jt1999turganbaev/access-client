import { useEffect, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { tabletApi } from '@/features/tablet/api/tablet-api';
import { resultTimeout, toAccessEvent } from '@/features/tablet/utils/access-event';
import { STREAM_PING_TIMEOUT, STREAM_RETRY_DELAY } from '@/shared/config/env';
import { playAudio } from '@/shared/lib';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import type { AccessDisplay } from '@/features/tablet/types';

/** Ulanish shu vaqtdan uzoq yashasa — rejali yopilish deb hisoblanadi */
const STABLE_AFTER = 5_000;

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

  useEffect(() => {
    if (!room) return;

    let disposed = false;
    let source: EventSource | null = null;
    let retryTimer: number | null = null;
    let watchdog: number | null = null;
    let lastEventId: number | null = null;
    let failures = 0;

    const clearTimers = () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      if (watchdog) window.clearTimeout(watchdog);
      retryTimer = null;
      watchdog = null;
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

      lastEventId = display.event_id;
      const event = toAccessEvent(display, room);
      // Faqat jonli hodisada — sahifa qayta ochilganda tiklangan eski hodisa ovoz chiqarmaydi
      if (event.greetingAudioUrl) playAudio(event.greetingAudioUrl);
      handlers.current.handleEvent(event);
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
        if (watchdog) window.clearTimeout(watchdog);
        watchdog = window.setTimeout(() => {
          if (source !== current) return;
          current.close();
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
        if (latest) {
          lastEventId = latest.event_id;
          const event = toAccessEvent(latest, room);
          const age = dayjs().diff(dayjs(latest.captured_at));
          const timeout = resultTimeout(event);
          if (age >= 0 && age < timeout) {
            handlers.current.showResult(event, timeout - age);
          }
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
      source?.close();
      handlers.current.setConnected(false);
    };
  }, [room, deviceId]);
}
