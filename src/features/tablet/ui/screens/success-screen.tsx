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
  const { event } = useTablet();
  const user = event?.user;

  if (!user || event?.status !== 'granted') return <Navigate to={ROUTES.IDLE} replace />;

  return (
    <div className={classes.result}>
      <div className={classes.avatarRow}>
        <StatusAvatar status="success" photoUrl={user.photoUrl} size={11} />
      </div>

      <div className={classes.welcome}>
        <div className={classes.welcomeText}>{t('success.welcome')}</div>
        <h1 className={classes.welcomeName}>{user.fullName}!</h1>
      </div>

      <TaskCard tasks={user.tasks} />
      <ResultCountdown />
    </div>
  );
}
