import { Navigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { StatusAvatar, StatusHeading } from '@/shared/ui';
import { UserInfoCard } from '../info-card/user-info-card';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import { ROUTES } from '@/shared/constants/routes';
import { ResultCountdown } from './result-countdown';
import classes from './screens.module.css';

export function DeniedScreen() {
  const { event, reset } = useTablet();
  const user = event?.user;

  if (!user || event?.status !== 'denied') return <Navigate to={ROUTES.IDLE} replace />;

  return (
    <div className={classes.result}>
      <div className={classes.avatarRow}>
        <StatusAvatar status="danger" photoUrl={user.photoUrl} size={15} />
      </div>

      <StatusHeading
        compact
        title="Xonaga"
        accent="ruxsat yo‘q!"
        accentColor="red"
        subtitle={`Kechirasiz, ${user.fullName}!`}
      />

      <UserInfoCard user={user} />

      <div className={classes.actions}>
        <Button
          className={classes.backBtn}
          h="5.2rem"
          px="2.4rem"
          styles={{ root: { borderRadius: '1rem', fontSize: 'var(--fs-md)' } }}
          leftSection={<IconArrowLeft className={classes.backIcon} />}
          onClick={reset}
        >
          Orqaga qaytish
        </Button>
      </div>
      <ResultCountdown danger />
    </div>
  );
}
