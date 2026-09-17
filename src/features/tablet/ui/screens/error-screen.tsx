import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { StatusAvatar, StatusHeading } from '@/shared/ui';
import { ERROR_TIMEOUT } from '@/shared/config/env';
import { ROUTES } from '@/shared/constants/routes';
import classes from './screens.module.css';

interface Props {
  /** Dev rejimida ko'rsatiladigan texnik xabar */
  detail?: string | null;
  /** Tugma bosilganda. Berilmasa — sahifa qayta yuklanadi */
  onRetry?: () => void;
}

/**
 * Noma'lum xato ekrani. Planshet kontekstisiz ham ishlaydi — shuning uchun
 * router'ning `errorElement` i sifatida ham ishlatiladi.
 */
export function ErrorScreen({ detail, onRetry }: Props) {
  const { t } = useTranslation();

  // Planshet nazoratsiz qolmasligi uchun xato ekrani ham o'zi bosh sahifaga qaytadi.
  // To'liq qayta yuklanadi — ilova buzilgan holatda qolmasligi uchun.
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.assign(ROUTES.IDLE), ERROR_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={classes.result}>
      {/* Boshqa natija ekranlari (denied, not found) bilan bir xil avatar */}
      <div className={classes.avatarRow}>
        <StatusAvatar status="danger" size={15} icon={<IconAlertTriangle stroke={1.8} />} />
      </div>

      <StatusHeading
        compact
        title={t('error.title')}
        accent={t('error.accent')}
        accentColor="red"
        subtitle={<span className={classes.notFoundText}>{t('error.text')}</span>}
      />

      {import.meta.env.DEV && detail && <div className={classes.errorDetail}>{detail}</div>}

      <div className={classes.actions}>
        <Button
          className={classes.backBtn}
          h="5.2rem"
          px="2.4rem"
          styles={{ root: { borderRadius: '1rem', fontSize: 'var(--fs-md)' } }}
          leftSection={<IconRefresh className={classes.backIcon} />}
          onClick={onRetry ?? (() => window.location.reload())}
        >
          {t('common.retry')}
        </Button>
      </div>

      {/* Planshet kontekstisiz ishlaydi — ResultCountdown o'rniga shu yerda chiziladi */}
      <div className={`${classes.countdown} ${classes.countdownDanger}`}>
        <div className={classes.countdownFill} style={{ animationDuration: `${ERROR_TIMEOUT}ms` }} />
      </div>
    </div>
  );
}
