/**
 * Sahifalar. Admin panelda (access) bular `lazy` yuklanadi, kioskda esa
 * yo'q: natija ekrani skanerlash paytida darhol chiqishi kerak, tarmoqdan
 * chunk kutib qolmasligi uchun hammasi asosiy bundle'da.
 */
export { default as Denied } from '@/pages/denied/denied';
export { default as ErrorPage } from '@/pages/error/error';
export { default as Idle } from '@/pages/idle/idle';
export { default as NotFound } from '@/pages/not-found/not-found';
export { default as Processing } from '@/pages/processing/processing';
export { default as Success } from '@/pages/success/success';
