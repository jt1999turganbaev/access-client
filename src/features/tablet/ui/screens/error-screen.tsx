import { useEffect } from 'react';
import { Button } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { StatusHeading } from '@/shared/ui';
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
  // Planshet nazoratsiz qolmasligi uchun xato ekrani ham o'zi bosh sahifaga qaytadi.
  // To'liq qayta yuklanadi — ilova buzilgan holatda qolmasligi uchun.
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.assign(ROUTES.IDLE), ERROR_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={classes.result}>
      <div className={classes.avatarRow}>
        <div className={classes.errorIconWrap}>
          <IconAlertTriangle className={classes.errorIcon} stroke={1.8} />
        </div>
      </div>

      <StatusHeading
        compact
        title="Xatolik"
        accent="yuz berdi!"
        accentColor="red"
        subtitle={
          <span className={classes.notFoundText}>
            Kutilmagan xato sodir bo‘ldi. Iltimos, qayta urinib ko‘ring yoki tizim
            administratoriga murojaat qiling.
          </span>
        }
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
          Qayta urinish
        </Button>
      </div>
    </div>
  );
}
