import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY } from '@/shared/constants/local-storage';
import { storage } from '@/shared/lib';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode } from '../languages';
import en from './locales/en.json';
import qq from './locales/qq.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

/**
 * Tarjimalar bundle ichida — planshet tarmoq yo'qligida ham (PWA) matnsiz qolmaydi.
 * Saqlangan til faqat ro'yxatdagilardan bo'lishi mumkin.
 */
const saved = storage.get(LANGUAGE_STORAGE_KEY);
const initialLanguage = SUPPORTED_LANGUAGES.includes(saved as LanguageCode)
  ? (saved as LanguageCode)
  : DEFAULT_LANGUAGE;

const applyLanguage = (language: string) => {
  storage.set(LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language;
};

i18n.on('languageChanged', applyLanguage);

void i18n.use(initReactI18next).init({
  resources: {
    qq: { main: qq },
    uz: { main: uz },
    ru: { main: ru },
    en: { main: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ['main'],
  defaultNS: 'main',
  interpolation: { escapeValue: false },
});

applyLanguage(initialLanguage);

export { i18n };
