import { useTranslation } from 'react-i18next';
import { IdentityCircle, StatusHeading } from '@/shared/ui';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './screens.module.css';

export function IdleScreen() {
  const { t } = useTranslation();
  const { room, connected } = useTablet();

  return (
    <div className={classes.center}>
      <IdentityCircle size={28} />

      {room?.number ? (
        // Xona tanlangan bo'lsa, sarlavhada o'sha xona raqami va nomi ko'rinadi
        <div className={classes.roomHeading}>
          <StatusHeading
            title={
              room.name?.trim()
                ? t('idle.roomTitleWithName', { number: room.number, name: room.name.trim() })
                : t('idle.roomTitle', { number: room.number })
            }
            accent={t('idle.roomAccent')}
            accentColor="blue"
          />
        </div>
      ) : (
        <StatusHeading title={t('idle.title')} accent={t('idle.accent')} accentColor="blue" />
      )}

      <div className={`${classes.pill} ${connected ? '' : classes.pillOffline}`}>
        <span className={classes.dot} />
        {connected ? t('idle.online') : t('idle.offline')}
      </div>
    </div>
  );
}
