/** Planshet API endpoint'lari (`VITE_API_URL` ga nisbatan). */
export const API_ROUTES = {
  ROOMS_LIST: '/rooms/list',
  ROOM_LATEST: (roomId: number) => `/rooms/${roomId}/latest`,
  ROOM_STREAM: (roomId: number) => `/rooms/${roomId}/stream`,
} as const;
