import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './screens.module.css';

/**
 * Ekran qachon yopilishini ko'rsatuvchi yupqa chiziq.
 * Vaqt CSS animatsiyasi bilan chiziladi — har soniyada qayta render bo'lmaydi.
 */
export function ResultCountdown({ danger }: { danger?: boolean }) {
  const { resultDuration } = useTablet();
  if (!resultDuration) return null;

  return (
    <div className={`${classes.countdown} ${danger ? classes.countdownDanger : ''}`}>
      <div className={classes.countdownFill} style={{ animationDuration: `${resultDuration}ms` }} />
    </div>
  );
}
