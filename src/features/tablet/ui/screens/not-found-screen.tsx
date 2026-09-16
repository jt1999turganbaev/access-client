import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { StatusAvatar, StatusHeading } from '@/shared/ui';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import { ROUTES } from '@/shared/constants/routes';
import { ResultCountdown } from './result-countdown';
import classes from './screens.module.css';

export function NotFoundScreen() {
  const { t } = useTranslation();
  const { event, reset } = useTablet();

  if (event?.status !== 'not_found') return <Navigate to={ROUTES.IDLE} replace />;

  return (
    <div className={classes.result}>
      <div className={classes.avatarRow}>
        <StatusAvatar status="danger" size={15} />
      </div>

      <StatusHeading
        compact
        title={t('notFound.title')}
        accent={t('notFound.accent')}
        accentColor="red"
        subtitle={<span className={classes.notFoundText}>{t('notFound.text')}</span>}
      />

      <div className={classes.actions}>
        <Button
          className={classes.backBtn}
          h="5.2rem"
          px="2.4rem"
          styles={{ root: { borderRadius: '1rem', fontSize: 'var(--fs-md)' } }}
          leftSection={<IconArrowLeft className={classes.backIcon} />}
          onClick={reset}
        >
          {t('common.back')}
        </Button>
      </div>
      <ResultCountdown danger />
    </div>
  );
}
