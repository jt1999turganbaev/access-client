export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/tablet',
  /** Rasm (photo) nisbiy yo'l bo'lib kelsa, shu origin'ga ulanadi */
  backendOrigin: import.meta.env.VITE_BACKEND_ORIGIN || window.location.origin,
};

/** Success va denied ekranlari shu vaqtdan keyin bosh sahifaga qaytadi (ms) */
export const RESULT_TIMEOUT = 10_000;
/** Chiqishda success ekrani shu vaqtdan keyin bosh sahifaga qaytadi (ms) */
export const EXIT_SUCCESS_TIMEOUT = 10_000;
/** Foydalanuvchi topilmadi ekrani — ko'rsatadigan ma'lumot kam, tezroq qaytadi (ms) */
export const NOT_FOUND_TIMEOUT = 5_000;
/**
 * Vazifa matni uzun bo'lsa vaqt o'qish tezligiga qarab uzayadi, lekin
 * MAX dan oshmaydi: odam o'qimay ketib qolsa, planshet ochiq turib qolmasligi kerak.
 */
export const READING_MS_PER_WORD = 350;
export const RESULT_TIMEOUT_MAX = 20_000;
/** Xato ekrani shu vaqtdan keyin bosh sahifaga qaytadi (ms) */
export const ERROR_TIMEOUT = 5_000;
/** Event kelgach PROCESSING animatsiyasi shuncha turadi (ms) */
export const PROCESSING_TIMEOUT = 900;
/** SSE uzilganda qayta ulanishdan oldin kutish (ms) */
export const STREAM_RETRY_DELAY = 3_000;
/**
 * Server har ~15 soniyada `ping` yuboradi. Shuncha vaqt hech narsa kelmasa,
 * ulanish jim uzilgan deb hisoblanadi va qayta ochiladi (ms).
 */
export const STREAM_PING_TIMEOUT = 45_000;
