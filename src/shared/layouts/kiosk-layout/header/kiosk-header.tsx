import { useClock } from '@/shared/hooks';
import classes from './kiosk-header.module.css';

export function KioskHeader() {
  const { time, date, weekday } = useClock();

  return (
    <header className={classes.header}>
      <div className={classes.brand}>
        <img
          className={classes.logo}
          src="/tmbm-logo.png"
          alt="Tibbiyot va farmatsevtika xodimlarining malakasini baholash markazi"
        />
        <div className={classes.system}>
          TIBBIYOT VA FARMATSEVTIKA
          <br />
          XODIMLARINING MALAKASINI
          <br />
          BAHOLASH MARKAZI
        </div>
      </div>

      <div className={classes.clock}>
        <div className={classes.time}>{time}</div>
        <div className={classes.weekday}>{weekday}</div>
        <div className={classes.date}>{date}</div>
      </div>
    </header>
  );
}
