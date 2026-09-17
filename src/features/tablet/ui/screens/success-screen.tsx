import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { StatusAvatar } from '@/shared/ui';
import { TaskCard } from '../info-card/task-card';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import { ROUTES } from '@/shared/constants/routes';
import { ResultCountdown } from './result-countdown';
import classes from './screens.module.css';

export function SuccessScreen() {
  const { t } = useTranslation();
  const { event, room } = useTablet();
  const user = event?.user;
  const station = room?.number_station?.trim();

  if (!user || event?.status !== 'granted') return <Navigate to={ROUTES.IDLE} replace />;

  // Hurmatli mehmon: rasm yo'q, "Hurmatli" deb murojaat, vazifa kartasi faqat vazifa bo'lsa
  const { isTop } = user;
  // TaskCard ham faqat matni bor vazifalarni ko'rsatadi
  const hasTasks = (user.tasks ?? []).some((task) => task?.description);

  return (
    <div className={`${classes.result} ${isTop && !hasTasks ? classes.resultCentered : ''}`}>
      {!isTop && (
        <div className={classes.avatarRow}>
          <StatusAvatar status="success" photoUrl={user.photoUrl} size={11} />
        </div>
      )}

      <div className={`${classes.welcome} ${isTop ? classes.welcomeTop : ''}`}>
        {station && <div className={classes.station}>{t('idle.station', { number: station })}</div>}
        <div className={classes.welcomeText}>
          {t('success.welcome')}
          {isTop && ` ${t('success.honorific')}`}
        </div>
        <h1 className={classes.welcomeName}>{user.fullName}!</h1>
      </div>

      {(!isTop || hasTasks) && <TaskCard tasks={user.tasks} />}
      <ResultCountdown />
    </div>
  );
}
