import { useEffect, useState } from 'react';
import { IconCheck, IconUserFilled, IconX } from '@tabler/icons-react';
import classes from './status-avatar.module.css';

interface Props {
  status: 'success' | 'danger';
  photoUrl?: string | null;
  /** Diametr, rem */
  size?: number;
}

export function StatusAvatar({ status, photoUrl, size = 19 }: Props) {
  const isSuccess = status === 'success';
  // Rasm manzili buzuq bo'lsa yoki yuklanmasa — siluet ko'rsatiladi
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [photoUrl]);
  const showPhoto = Boolean(photoUrl) && !photoFailed;

  return (
    <div
      className={`${classes.wrap} ${classes.appear}`}
      style={{ ['--avatar-size' as string]: `${size}rem` }}
    >
      <div className={`${classes.glow} ${isSuccess ? classes.glowSuccess : classes.glowDanger}`} />
      <div className={`${classes.ring} ${isSuccess ? classes.ringSuccess : classes.ringDanger}`}>
        {showPhoto ? (
          <img
            className={classes.photo}
            src={photoUrl as string}
            alt=""
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className={classes.placeholder}>
            <IconUserFilled className={classes.placeholderIcon} />
          </div>
        )}
      </div>
      <div className={`${classes.badge} ${isSuccess ? classes.badgeSuccess : classes.badgeDanger}`}>
        {isSuccess ? (
          <IconCheck className={classes.badgeIcon} stroke={3.4} />
        ) : (
          <IconX className={classes.badgeIcon} stroke={3.4} />
        )}
      </div>
    </div>
  );
}
