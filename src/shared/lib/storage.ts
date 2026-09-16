/**
 * localStorage har doim ham ishlamaydi: maxfiy rejim, o'chirilgan sayt ma'lumotlari,
 * to'lgan xotira — bularning har biri istisno tashlaydi. Planshet shu sababdan
 * ishdan chiqmasligi uchun barcha murojaatlar shu yerda himoyalangan.
 */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  getJson<T>(key: string): T | null {
    const raw = storage.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson(key: string, value: unknown): boolean {
    try {
      return storage.set(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* e'tiborsiz */
    }
  },
};
