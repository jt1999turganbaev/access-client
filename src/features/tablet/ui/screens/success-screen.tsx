import { Navigate } from 'react-router-dom';
import { StatusAvatar, StatusHeading } from '@/shared/ui';
import { UserInfoCard } from '../info-card/user-info-card';
import { TaskCard } from '../info-card/task-card';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import { ROUTES } from '@/shared/constants/routes';
import { ResultCountdown } from './result-countdown';
import classes from './screens.module.css';

export function SuccessScreen() {
  const { event } = useTablet();
  const user = event?.user;

  if (!user || event?.status !== 'granted') return <Navigate to={ROUTES.IDLE} replace />;

  return (
    <div className={classes.result}>
      <div className={classes.avatarRow}>
        <StatusAvatar status="success" photoUrl={user.photoUrl} size={11} />
      </div>

      <StatusHeading
        compact
        title="Kirishga"
        accent="ruxsat berildi!"
        accentColor="green"
        subtitle={`Xush kelibsiz, ${user.fullName}!`}
      />

      <UserInfoCard user={user} />
      <TaskCard tasks={user.tasks} />
      <ResultCountdown />
    </div>
  );
}
