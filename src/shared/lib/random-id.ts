/**
 * Tasodifiy identifikator.
 *
 * `crypto.randomUUID()` faqat xavfsiz kontekstda (HTTPS yoki localhost) mavjud.
 * Planshet HTTP orqali ochilganda u `undefined` bo'ladi va chaqirilsa ilova
 * ishga tushmay qoladi — shuning uchun bosqichma-bosqich zaxira variantlar.
 */
export function randomId(length = 8): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replace(/-/g, '').slice(0, length);
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(Math.ceil(length / 2));
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, length);
    }
  } catch {
    /* zaxira variantga o'tamiz */
  }
  return Math.random().toString(36).slice(2, 2 + length);
}
