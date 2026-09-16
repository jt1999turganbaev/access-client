import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deviceStorage, roomStorage, tabletApi } from '@/features/tablet/api/tablet-api';
import type { AccessEvent, AccessStatus, Room, TabletState } from '@/features/tablet/types';
import { PROCESSING_TIMEOUT, STREAM_RETRY_DELAY } from '@/shared/config/env';
import { resultTimeout } from '@/features/tablet/utils/access-event';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
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

  // Xona tanlanmagan bo'lsa server tekshiriladi: javob kelmaguncha har STREAM_RETRY_DELAY da qayta so'raladi
  const roomsQuery = useQuery({
    queryKey: [QUERY_KEYS.ROOMS],
    queryFn: tabletApi.getRooms,
    enabled: needsRoomSetup || roomSetupOpen,
    retry: needsRoomSetup ? true : 1,
    retryDelay: STREAM_RETRY_DELAY,
  });

  const roomsLoaded = roomsQuery.data !== undefined;
  const connected = needsRoomSetup ? roomsQuery.status === 'success' : streamConnected;

  const clearTimers = useCallback(() => {
    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    if (resultTimer.current) window.clearTimeout(resultTimer.current);
    processingTimer.current = null;
    resultTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState('idle');
    setEvent(null);
    navigate(ROUTES.IDLE, { replace: true });
  }, [clearTimers, navigate]);

  const showResult = useCallback(
    (next: AccessEvent, timeout?: number) => {
      clearTimers();
      // Ruxsat berilganda (success) ekran avtomatik bosh sahifaga qaytmaydi —
      // keyingi hodisa kelguncha yoki reset() chaqirilguncha turadi
      const autoReset = next.status !== 'granted';
      const duration = autoReset ? (timeout ?? resultTimeout(next)) : 0;
      setEvent(next);
      setResultDuration(duration);
      setState(stateByStatus[next.status]);
      navigate(routeByStatus[next.status], { replace: true });
      if (autoReset) resultTimer.current = window.setTimeout(reset, duration);
    },
    [clearTimers, navigate, reset],
  );

  const handleEvent = useCallback(
    (next: AccessEvent) => {
      clearTimers();
      setState('processing');
      setEvent(null);
      navigate(ROUTES.PROCESSING, { replace: true });
      processingTimer.current = window.setTimeout(() => showResult(next), PROCESSING_TIMEOUT);
    },
    [clearTimers, navigate, showResult],
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
