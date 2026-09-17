let current: HTMLAudioElement | null = null;

/**
 * Audio faylni ijro etadi; oldingisi hali tugamagan bo'lsa to'xtatiladi.
 *
 * Brauzer ekranga hech teginilmagan sahifada ovozni bloklaydi (autoplay policy) —
 * planshet ochilgandan keyin kamida bir marta teginish kerak. Bloklansa ekran
 * ishlashda davom etadi, faqat ovoz chiqmaydi.
 */
export function playAudio(url: string) {
  current?.pause();
  const audio = new Audio(url);
  current = audio;
  audio.play().catch((error: unknown) => {
    if (current === audio) current = null;
    const name = error instanceof DOMException ? error.name : '';
    // AbortError — keyingi audio boshlanib, bu to'xtatildi; bu xato emas
    if (name === 'AbortError') return;
    console.warn(
      name === 'NotAllowedError'
        ? 'Ovoz bloklandi: planshet ekraniga kamida bir marta teginish kerak'
        : 'Audio ijro etilmadi',
      error,
    );
  });
}
