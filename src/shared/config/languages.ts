/** Planshet shu tilda ochiladi — tanlangan til saqlanmagan bo'lsa */
export const DEFAULT_LANGUAGE = 'qr';

/** Qo'llab-quvvatlanadigan tillar — access loyihasidagi to'plam, qoraqalpoqcha birinchi */
export const LANGUAGES = [
  { code: 'qr', label: 'Qaraqalpaqsha' },
  { code: 'uz', label: 'O‘zbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const SUPPORTED_LANGUAGES: LanguageCode[] = LANGUAGES.map((item) => item.code);

/** Sozlamalarda tanlash uchun ko'rsatiladigan tillar — qolganlari tarjimada saqlanadi */
export const SELECTABLE_LANGUAGES = LANGUAGES.filter((item) => item.code === 'qr' || item.code === 'uz');
