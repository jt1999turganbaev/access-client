/** Yuklanmagan yoki server xatosi (502/504) bo'lsa, shuncha kutib bir marta qayta urinadi (ms) */
const RETRY_DELAY = 1_500;
/**
 * Ovoz shu vaqt ichida boshlanmasa bekor qilinadi (ms) — kechikib kelgan salomlashuv
 * odam ketib bo'lgandan keyin aytilmasligi uchun.
 */
const START_TIMEOUT = 15_000;

let current: HTMLAudioElement | null = null;

/** Ijroni to'xtatadi va yuklanishni ham uzadi — tarmoq resursi bo'shaydi */
function stop(audio: HTMLAudioElement) {
  try {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  } catch {
    /* e'tiborsiz */
  }
}

interface PlayAudioOptions {
  /** Ovoz umuman ijro etilmadi (bloklandi, yuklanmadi, kechikdi) */
  onFail?: () => void;
}

/**
 * Audio faylni ijro etadi; oldingisi hali tugamagan bo'lsa to'xtatiladi.
 * Hech qachon istisno tashlamaydi — ovoz chiqmasa ham ekran ishlashda davom etadi.
 *
 * - Brauzer ekranga hech teginilmagan sahifada ovozni bloklaydi (autoplay policy) —
 *   planshet ochilgandan keyin kamida bir marta teginish kerak.
 * - Fayl yuklanmasa (tarmoq, 502/504) — bir marta qayta urinadi.
 * - START_TIMEOUT ichida boshlanmasa — bekor qilinadi.
 */
export function playAudio(url: string, { onFail }: PlayAudioOptions = {}) {
  if (current) {
    stop(current);
    current = null;
  }

  if (!url || typeof Audio === 'undefined') {
    onFail?.();
    return;
  }

  let audio: HTMLAudioElement;
  try {
    audio = new Audio(url);
  } catch (error) {
    console.warn('Audio yaratilmadi', error);
    onFail?.();
    return;
  }

  current = audio;
  let started = false;
  let retried = false;
  let startTimer: number | null = null;

  const isCurrent = () => current === audio;

  const cleanup = () => {
    if (startTimer) window.clearTimeout(startTimer);
    startTimer = null;
  };

  const fail = (message: string, error?: unknown) => {
    if (!isCurrent()) return;
    cleanup();
    stop(audio);
    current = null;
    console.warn(message, error ?? '');
    onFail?.();
  };

  const start = () => {
    audio.play().catch((error: unknown) => {
      if (!isCurrent()) return;
      const name = error instanceof DOMException ? error.name : '';
      // AbortError — qayta yuklash yoki to'xtatish sababli; NotSupportedError — `error` hodisasida ko'riladi
      if (name === 'AbortError' || name === 'NotSupportedError') return;
      fail(
        name === 'NotAllowedError'
          ? 'Ovoz bloklandi: planshet ekraniga kamida bir marta teginish kerak'
          : 'Audio ijro etilmadi',
        error,
      );
    });
  };

  audio.addEventListener('playing', () => {
    started = true;
    cleanup();
  });

  audio.addEventListener('ended', () => {
    cleanup();
    if (isCurrent()) current = null;
  });

  audio.addEventListener('error', () => {
    if (!isCurrent()) return;
    // Faqat boshlanmagan bo'lsa qayta urinamiz — o'rtasidan boshidan qayta aytilmasin
    if (!started && !retried) {
      retried = true;
      window.setTimeout(() => {
        if (!isCurrent()) return;
        audio.src = url;
        audio.load();
        start();
      }, RETRY_DELAY);
      return;
    }
    fail('Audio yuklanmadi', audio.error);
  });

  startTimer = window.setTimeout(() => {
    if (!started) fail('Audio o‘z vaqtida yuklanmadi — bekor qilindi');
  }, START_TIMEOUT);

  start();
}
