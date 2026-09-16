import { IconUserScan } from '@tabler/icons-react';
import classes from './identity-circle.module.css';

interface Props {
  /** Diametr, rem */
  size?: number;
  scanning?: boolean;
}

export function IdentityCircle({ size = 28, scanning = false }: Props) {
  return (
    <div
      className={`${classes.wrap} ${scanning ? '' : classes.pulse}`}
      style={{ ['--circle-size' as string]: `${size}rem` }}
    >
      <div className={classes.halo} />
      <div className={classes.ringOuter} />
      <div className={`${classes.ringAccent} ${scanning ? classes.spinFast : classes.spin}`} />
      <div className={classes.inner} />
      <IconUserScan className={classes.icon} stroke={1.5} />
      {scanning && <div className={classes.scanline} />}
    </div>
  );
}
