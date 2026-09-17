import { useTranslation } from 'react-i18next';
import { ActionIcon, Portal } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './settings-button.module.css';

/**
 * Sozlash tugmasi — barcha ekranlarda pastki chap burchakda.
 * Bosh ekranda xona va til, qolgan ekranlarda faqat til o'zgartiriladi.
 */
export function SettingsButton() {
  const { t } = useTranslation();
  const { openRoomSetup, room, state } = useTablet();
  const mode = state === 'idle' ? 'full' : 'language';

  return (
    // Portal: tugma layout'ning stacking context'idan chiqariladi — footer ustida qoladi
    <Portal>
      <ActionIcon
        className={classes.settings}
        variant="white"
        radius="xl"
        aria-label={
          room ? `${t('common.settings')} · ${room.number} ${room.name}` : t('common.settings')
        }
        title={room ? `${room.number} ${room.name}` : t('common.settings')}
        onClick={() => openRoomSetup(mode)}
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
  );
}
