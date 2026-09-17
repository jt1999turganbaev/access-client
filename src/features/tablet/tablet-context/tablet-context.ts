import { createContext, useContext } from 'react';
import type { AccessEvent, Room, SettingsMode, TabletState } from '@/features/tablet/types';

export interface TabletContextValue {
  /** Planshetga biriktirilgan xona */
  room: Room | null;
  /** Xona tanlanmagan — modal yopib bo'lmaydi */
  needsRoomSetup: boolean;
  /** Modal ochiqmi. Xona tanlanmagan bo'lsa — server javob berishi bilan avtomatik ochiladi */
  roomSetupOpen: boolean;
  /** `full` — xona va til (bosh ekranda), `language` — faqat til (boshqa ekranlarda) */
  settingsMode: SettingsMode;
  /** GET /rooms/list */
  rooms: Room[];
  roomsLoading: boolean;
  roomsError: boolean;
  refetchRooms: () => void;
  openRoomSetup: (mode?: SettingsMode) => void;
  closeRoomSetup: () => void;
  saveRoom: (room: Room, deviceId?: string) => void;
  /** Xona serverda topilmasa — biriktirishni bekor qilib, tanlash oynasini ochadi */
  clearRoom: () => void;
  /** Planshet identifikatori — SSE oqimiga yuboriladi (dashboard uchun) */
  deviceId: string;

  /** Server bilan aloqa: xona bo'lsa — SSE holati, bo'lmasa — /rooms/list javobi */
  connected: boolean;
  setConnected: (value: boolean) => void;

  state: TabletState;
  event: AccessEvent | null;
  /** Joriy natija ekrani necha ms turadi (hisoblagich chizig'i uchun) */
  resultDuration: number;
  /** Yangi event: qisqa PROCESSING, so'ng natija */
  handleEvent: (event: AccessEvent) => void;
  /** Natijani darhol ko'rsatish (masalan, qayta ulanganda tiklash) */
  showResult: (event: AccessEvent, timeout?: number) => void;
  reset: () => void;
}

export const TabletContext = createContext<TabletContextValue | null>(null);

export function useTablet() {
  const ctx = useContext(TabletContext);
  if (!ctx) throw new Error('useTablet must be used inside TabletProvider');
  return ctx;
}
