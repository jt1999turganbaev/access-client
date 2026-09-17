import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { deviceStorage, roomStorage, tabletApi } from '@/features/tablet/api/tablet-api';
import type { AccessEvent, AccessStatus, Room, TabletState } from '@/features/tablet/types';
import { PROCESSING_TIMEOUT, RESULT_TIMEOUT, STREAM_RETRY_DELAY } from '@/shared/config/env';
import {
  greetingScreenTimeout,
  isExitSuccess,
  screenTimeout,
} from '@/features/tablet/utils/access-event';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { playAudio } from '@/shared/lib';
import { ROUTES } from '@/shared/constants/routes';
import { TabletContext, type TabletContextValue } from './tablet-context';

const routeByStatus: Record<AccessStatus, string> = {
  granted: ROUTES.SUCCESS,
  denied: ROUTES.DENIED,
  not_found: ROUTES.NOT_FOUND,
};

const stateByStatus: Record<AccessStatus, TabletState> = {
  granted: 'success',
  denied: 'denied',
  not_found: 'not-found',
};

export function TabletProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(() => roomStorage.get());
  const [deviceId, setDeviceId] = useState<string>(() => deviceStorage.get());
  const [roomSetupOpen, setRoomSetupOpen] = useState(false);
  const [streamConnected, setConnected] = useState(false);
  const [state, setState] = useState<TabletState>('idle');
  /** Joriy natija ekrani necha ms turadi — pastdagi hisoblagich chizig'i shuni chizadi */
  const [resultDuration, setResultDuration] = useState(0);
  const [event, setEvent] = useState<AccessEvent | null>(null);

  const processingTimer = useRef<number | null>(null);
  const resultTimer = useRef<number | null>(null);

  const needsRoomSetup = !room;

  // Xona nomi tanlangan tilda keladi — til o'zgarsa ro'yxat qayta so'raladi
  const { i18n } = useTranslation();

  // Xona tanlanmagan bo'lsa server tekshiriladi: javob kelmaguncha har STREAM_RETRY_DELAY da qayta so'raladi.
  // Tanlangan bo'lsa ham bir marta so'raladi — saqlangan xona ma'lumoti yangilanishi uchun.
  const roomsQuery = useQuery({
    queryKey: [QUERY_KEYS.ROOMS, i18n.resolvedLanguage],
    queryFn: tabletApi.getRooms,
    retry: needsRoomSetup ? true : 1,
    retryDelay: STREAM_RETRY_DELAY,
    // Til almashganda yangi ro'yxat kelguncha eskisi turadi — oyna yopilib-ochilib ketmaydi
    placeholderData: (previous) => previous,
  });

  // Saqlangan xona eski bo'lishi mumkin (boshqa tildagi nom, `number_station` yo'q) — serverdagisi bilan yangilanadi
  const freshRoom = room ? roomsQuery.data?.find((item) => item.id === room.id) : undefined;
  useEffect(() => {
    if (!freshRoom) return;
    setRoom((current) => {
      if (
        !current ||
        current.id !== freshRoom.id ||
        (current.name === freshRoom.name &&
          current.number === freshRoom.number &&
          current.number_station === freshRoom.number_station)
      ) {
        return current;
      }
      roomStorage.set(freshRoom);
      return freshRoom;
    });
  }, [freshRoom]);

  const roomsLoaded = roomsQuery.data !== undefined;
  const connected = needsRoomSetup ? roomsQuery.status === 'success' : streamConnected;

  const clearTimers = useCallback(() => {
    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    if (resultTimer.current) window.clearTimeout(resultTimer.current);
    processingTimer.current = null;
    resultTimer.current = null;
  }, []);

  /** Ekran ochiq turgan paytda kimga salomlashuv aytilgan — shu odam qayta tanilsa ovoz takrorlanmaydi */
  const greetedUserId = useRef<string | number | null>(null);

  /** Shu odamning salomlashuv ovozi qancha davom etadi (ms) — ekran shunga qarab turadi */
  const greetingMs = useRef<{ userId: string | number | null; ms: number } | null>(null);

  const reset = useCallback(() => {
    clearTimers();
    greetedUserId.current = null;
    greetingMs.current = null;
    setState('idle');
    setEvent(null);
    navigate(ROUTES.IDLE, { replace: true });
  }, [clearTimers, navigate]);

  /** Ekran shu vaqtdan keyin bosh sahifaga qaytadi; pastdagi chiziq ham shuni chizadi */
  const scheduleReset = useCallback(
    (duration: number) => {
      // Buzuq qiymat (Infinity, NaN, manfiy) bilan ekran qotib qolmasligi kerak
      const safe = Number.isFinite(duration) && duration > 0 ? Math.round(duration) : RESULT_TIMEOUT;
      if (resultTimer.current) window.clearTimeout(resultTimer.current);
      setResultDuration(safe);
      resultTimer.current = window.setTimeout(reset, safe);
    },
    [reset],
  );

  /** Shu hodisa uchun ma'lum bo'lgan ovoz uzunligi (boshqa odamniki bo'lsa — yo'q) */
  const audioMsFor = (next: AccessEvent) =>
    greetingMs.current?.userId === (next.user?.id ?? null) ? greetingMs.current.ms : null;

  const showResult = useCallback(
    (next: AccessEvent, timeout?: number) => {
      clearTimers();
      // Kirishdagi success salomlashuv ovoziga qarab, qolgan ekranlar belgilangan vaqtga qarab qaytadi
      const duration = timeout ?? screenTimeout(next, audioMsFor(next));
      setEvent(next);
      setState(stateByStatus[next.status]);
      navigate(routeByStatus[next.status], { replace: true });
      scheduleReset(duration);
    },
    [clearTimers, navigate, scheduleReset],
  );

  // handleEvent qayta yaratilmasligi uchun joriy holat va hodisa ref'da
  const stateRef = useRef(state);
  stateRef.current = state;
  const eventRef = useRef(event);
  eventRef.current = event;

  const handleEvent = useCallback(
    (next: AccessEvent) => {
      // Ovoz faqat odam almashganda yoki ekran bosh sahifaga qaytgandan keyin ijro etiladi —
      // bir odam turib qolib qayta-qayta tanilsa, salomlashuv takrorlanmaydi
      const userId = next.user?.id ?? null;
      const shouldGreet =
        !!next.greetingAudioUrl && (userId == null || userId !== greetedUserId.current);
      greetedUserId.current = userId;
      if (shouldGreet && next.greetingAudioUrl) {
        greetingMs.current = null;
        playAudio(next.greetingAudioUrl, {
          // Ovoz chiqmagan bo'lsa, shu odam qayta tanilganda yana urinib ko'riladi
          onFail: () => {
            if (greetedUserId.current === userId) greetedUserId.current = null;
          },
          // Uzunlik ekran ochilgandan keyin ma'lum bo'lsa, vaqt shunga moslanadi
          onDuration: (seconds) => {
            if (!Number.isFinite(seconds) || seconds <= 0) return;
            greetingMs.current = { userId, ms: Math.round(seconds * 1000) };
            const shown = eventRef.current;
            if (stateRef.current !== 'success' || !shown || isExitSuccess(shown)) return;
            if ((shown.user?.id ?? null) !== userId) return;
            scheduleReset(greetingScreenTimeout(shown, greetingMs.current.ms));
          },
        });
      }

      // Natija ekrani ochiq bo'lsa (success ekran o'zi yopilmaydi) — yangi natija loadersiz
      // darhol almashadi, har bir hodisada loader qayta-qayta chiqmaydi
      const current = stateRef.current;
      if (current !== 'idle' && current !== 'processing') {
        showResult(next);
        return;
      }
      clearTimers();
      setState('processing');
      setEvent(null);
      navigate(ROUTES.PROCESSING, { replace: true });
      processingTimer.current = window.setTimeout(() => showResult(next), PROCESSING_TIMEOUT);
    },
    [clearTimers, navigate, scheduleReset, showResult],
  );

  const saveRoom = useCallback(
    (next: Room, nextDeviceId?: string) => {
      const device = nextDeviceId?.trim();
      if (device) {
        deviceStorage.set(device);
        setDeviceId(device);
      }
      roomStorage.set(next);
      setRoom(next);
      setRoomSetupOpen(false);
      reset();
    },
    [reset],
  );

  /** Xona serverda yo'q (o'chirilgan) — biriktirishni bekor qilamiz */
  const clearRoom = useCallback(() => {
    roomStorage.clear();
    setRoom(null);
    reset();
  }, [reset]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo<TabletContextValue>(
    () => ({
      room,
      needsRoomSetup,
      // Xona yo'q: server xonalar ro'yxatini bergan zahoti ochiladi va tanlanmaguncha yopilmaydi
      roomSetupOpen: needsRoomSetup ? roomsLoaded : roomSetupOpen,
      rooms: roomsQuery.data ?? [],
      roomsLoading: roomsQuery.isLoading,
      roomsError: roomsQuery.isError,
      refetchRooms: () => void roomsQuery.refetch(),
      openRoomSetup: () => setRoomSetupOpen(true),
      closeRoomSetup: () => {
        if (!needsRoomSetup) setRoomSetupOpen(false);
      },
      saveRoom,
      clearRoom,
      deviceId,
      connected,
      setConnected,
      state,
      event,
      resultDuration,
      handleEvent,
      showResult,
      reset,
    }),
    [
      room,
      needsRoomSetup,
      roomSetupOpen,
      roomsLoaded,
      roomsQuery.data,
      roomsQuery.isLoading,
      roomsQuery.isError,
      roomsQuery.refetch,
      saveRoom,
      clearRoom,
      deviceId,
      connected,
      state,
      event,
      resultDuration,
      handleEvent,
      showResult,
      reset,
    ],
  );

  return <TabletContext.Provider value={value}>{children}</TabletContext.Provider>;
}
