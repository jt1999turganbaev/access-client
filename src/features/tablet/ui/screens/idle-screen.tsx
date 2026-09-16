import { useTranslation } from 'react-i18next';
import { ActionIcon, Portal } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { IdentityCircle, StatusHeading } from '@/shared/ui';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './screens.module.css';

export function IdleScreen() {
  const { t } = useTranslation();
  const { openRoomSetup, room, connected } = useTablet();

  return (
    <div className={classes.center}>
      <IdentityCircle size={28} />

      {room?.number ? (
        // Xona tanlangan bo'lsa, sarlavhada o'sha xona raqami ko'rinadi
        <div className={classes.roomHeading}>
          <StatusHeading
            title={t('idle.roomTitle', { number: room.number })}
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

      {/* Portal: tugma layout'ning stacking context'idan chiqariladi — footer ustida qoladi */}
      <Portal>
        <ActionIcon
          className={classes.settings}
          variant="white"
          radius="xl"
          aria-label={
            room ? `${t('common.settings')} · ${room.number} ${room.name}` : t('common.settings')
          }
          title={room ? `${room.number} ${room.name}` : t('common.settings')}
          onClick={openRoomSetup}
          styles={{
            root: {
              // Ekranning pastki chap burchagi (Mantine'ning position: relative'ini bosib o'tadi)
              position: 'fixed',
              left: '1.6rem',
              bottom: '1.2rem',
              zIndex: 100,
              width: '2.6rem',
              height: '2.6rem',
              minWidth: '2.6rem',
              minHeight: '2.6rem',
              color: '#4c6494',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(190, 212, 243, 0.9)',
            },
          }}
        >
          <IconSettings className={classes.settingsIcon} />
        </ActionIcon>
      </Portal>
    </div>
  );
}
