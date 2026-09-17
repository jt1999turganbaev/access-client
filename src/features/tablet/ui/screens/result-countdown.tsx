import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './screens.module.css';

/**
 * Ekran qachon yopilishini ko'rsatuvchi yupqa chiziq.
 * Vaqt CSS animatsiyasi bilan chiziladi — har soniyada qayta render bo'lmaydi.
 */
export function ResultCountdown({ danger, compact }: { danger?: boolean; compact?: boolean }) {
  const { resultDuration, event } = useTablet();
  if (!resultDuration) return null;

  return (
    <div
      className={`${classes.countdown} ${danger ? classes.countdownDanger : ''} ${compact ? classes.countdownCompact : ''}`}
    >
      {/* Taymer qayta qo'yilganda (yangi hodisa yoki ovoz uzunligi ma'lum bo'ldi) chiziq boshidan chiziladi */}
      <div
        key={`${event?.id}-${resultDuration}`}
        className={classes.countdownFill}
        style={{ animationDuration: `${resultDuration}ms` }}
      />
    </div>
  );
}
