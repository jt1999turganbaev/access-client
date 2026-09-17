import type { AccessDisplay, Room } from '@/features/tablet/types';
import { API_ROUTES } from '@/shared/constants/api-routes';
import { DEVICE_ID_STORAGE_KEY, ROOM_STORAGE_KEY } from '@/shared/constants/local-storage';
import { env } from '@/shared/config/env';
import { getLocale, http } from '@/shared/http';
import { randomId, storage } from '@/shared/lib';
import type { ResponseWithData } from '@/shared/types';

/** Backend javobi kutilgan shaklda ekanini tekshiradi — buzuq javob ekranni buzmasligi kerak */
function isRoom(value: unknown): value is Room {
  const room = value as Room | null;
  return (
    !!room &&
    typeof room === 'object' &&
    typeof room.id === 'number' &&
    Number.isFinite(room.id) &&
    typeof room.name === 'string' &&
    typeof room.number === 'string'
  );
}

function isAccessDisplay(value: unknown): value is AccessDisplay {
  const item = value as AccessDisplay | null;
  return !!item && typeof item === 'object' && typeof item.event_id === 'number';
}

/** Planshetga biriktirilgan xona — backend saqlamaydi, planshetning o'zida turadi */
export const roomStorage = {
  get(): Room | null {
    const room = storage.getJson<unknown>(ROOM_STORAGE_KEY);
    // Buzuq yoki eski formatdagi yozuv bo'lsa — yo'q deb hisoblaymiz,
    // shunda planshet xona tanlash oynasini ko'rsatadi va qotib qolmaydi.
    if (!isRoom(room)) {
      if (room !== null) storage.remove(ROOM_STORAGE_KEY);
      return null;
    }
    return room;
  },
  set(room: Room) {
    storage.setJson(ROOM_STORAGE_KEY, room);
  },
  clear() {
    storage.remove(ROOM_STORAGE_KEY);
  },
};

/**
 * Planshetning identifikatori. Birinchi ishga tushganda generatsiya qilinadi va
 * SSE oqimiga `?device=` bilan yuboriladi — dashboard planshet tirik ekanini
 * va qaysi xonani ko'rsatayotganini shu orqali biladi.
 */
export const deviceStorage = {
  get(): string {
    const saved = storage.get(DEVICE_ID_STORAGE_KEY);
    if (saved) return saved;

    const id = `tablet-${randomId(8)}`;
    // Saqlash ishlamasa ham (maxfiy rejim) id qaytariladi — faqat har safar yangi bo'ladi
    storage.set(DEVICE_ID_STORAGE_KEY, id);
    return id;
  },
  set(id: string) {
    storage.set(DEVICE_ID_STORAGE_KEY, id);
  },
};

export const tabletApi = {
  /** GET /rooms/list — faol xonalar */
  async getRooms(): Promise<Room[]> {
    const { data } = await http.get<ResponseWithData<Room[]>>(API_ROUTES.ROOMS_LIST);
    const rooms = data?.data;
    // Kutilmagan javob — xato deb hisoblaymiz, shunda so'rov qayta urinadi
    if (!Array.isArray(rooms)) throw new Error('Xonalar ro‘yxati kutilgan formatda emas');
    return rooms.filter(isRoom);
  },

  /** GET /rooms/{id}/latest — oxirgi identifikatsiya (hech kim kelmagan bo'lsa null) */
  async getLatest(roomId: number): Promise<AccessDisplay | null> {
    const { data } = await http.get<ResponseWithData<AccessDisplay | null>>(
      API_ROUTES.ROOM_LATEST(roomId),
    );
    const latest = data?.data;
    return isAccessDisplay(latest) ? latest : null;
  },

  /** GET /rooms/{id}/stream — SSE manzili */
  streamUrl(roomId: number, afterEventId?: number | null, device?: string | null) {
    const base = env.apiUrl.replace(/\/$/, '');
    const params = new URLSearchParams();
    if (typeof afterEventId === 'number' && Number.isFinite(afterEventId)) {
      params.set('after_event_id', String(afterEventId));
    }
    if (device) params.set('device', device);
    // EventSource header yubora olmaydi — til query orqali beriladi
    params.set('locale', getLocale());
    const query = params.toString() ? `?${params}` : '';
    return `${base}${API_ROUTES.ROOM_STREAM(roomId)}${query}`;
  },
};
