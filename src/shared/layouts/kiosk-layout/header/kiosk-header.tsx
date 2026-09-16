import { useTranslation } from 'react-i18next';
import { useClock } from '@/shared/hooks';
import classes from './kiosk-header.module.css';

export function KioskHeader() {
  const { t } = useTranslation();
  const { time, date, weekday } = useClock();

  return (
    <header className={classes.header}>
      <div className={classes.brand}>
        <img className={classes.logo} src="/tmbm-logo.png" alt={t('header.org')} />
        <div className={classes.system}>{t('header.org')}</div>
      </div>

      <div className={classes.clock}>
        <div className={classes.time}>{time}</div>
        <div className={classes.weekday}>{weekday}</div>
        <div className={classes.date}>{date}</div>
      </div>
    </header>
  );
}
