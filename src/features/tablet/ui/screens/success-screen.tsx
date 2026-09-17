import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { IconShieldCheck } from '@tabler/icons-react';
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

  // "Hurmatli" deb murojaat, vazifa kartasi faqat vazifa bo'lsa.
  // TaskCard ham faqat matni bor vazifalarni ko'rsatadi.
  // Nazoratchiga vazifa o'rniga uning roli ko'rsatiladi
  const isSupervisor = user.role === 'nazoratchi';
  const hasTasks = !isSupervisor && (user.tasks ?? []).some((task) => task?.description);

  return (
    <div className={`${classes.result} ${hasTasks ? '' : classes.resultCentered}`}>
      <div className={classes.avatarRow}>
        <StatusAvatar status="success" photoUrl={user.photoUrl} size={11} />
      </div>

      <div className={classes.welcome}>
        {station && <div className={classes.station}>{t('idle.station', { number: station })}</div>}
        <div className={classes.welcomeText}>
          {t('success.welcome')} {t('success.honorific')}
        </div>
        <h1 className={classes.welcomeName}>{user.fullName}!</h1>
      </div>

      {isSupervisor && (
        <div className={classes.roleRow}>
          <div className={classes.role}>
            <IconShieldCheck className={classes.roleIcon} stroke={1.8} />
            {t('success.supervisor')}
          </div>
        </div>
      )}

      {hasTasks && <TaskCard tasks={user.tasks} />}
      <ResultCountdown compact />
    </div>
  );
}
