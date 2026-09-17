import axios from 'axios';
import { env } from '@/shared/config/env';
import { DEFAULT_LANGUAGE } from '@/shared/config/languages';
import { LANGUAGE_STORAGE_KEY } from '@/shared/constants/local-storage';
import { storage } from '@/shared/lib';

/** Backendga yuboriladigan joriy til */
export function getLocale() {
  const detectedLanguage = storage.get(LANGUAGE_STORAGE_KEY);
  return detectedLanguage?.slice(0, 2) || DEFAULT_LANGUAGE;
}

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

// Har bir so'rovda joriy til `locale` header'ida yuboriladi — backend javoblarni shu tilda qaytaradi
http.interceptors.request.use((config) => {
  config.headers['locale'] = getLocale();
  return config;
});
