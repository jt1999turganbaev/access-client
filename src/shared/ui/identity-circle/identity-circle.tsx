import { IconUserScan } from '@tabler/icons-react';
import classes from './identity-circle.module.css';

interface Props {
  /** Diametr, rem */
  size?: number;
  scanning?: boolean;
  /** Ikonka o'lchami, rem. Berilmasa — diametrning 38% i */
  iconSize?: number;
}

export function IdentityCircle({ size = 28, scanning = false, iconSize }: Props) {
  return (
    <div
      className={`${classes.wrap} ${scanning ? '' : classes.pulse}`}
      style={{
        ['--circle-size' as string]: `${size}rem`,
        ...(iconSize ? { ['--icon-size' as string]: `${iconSize}rem` } : {}),
      }}
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
