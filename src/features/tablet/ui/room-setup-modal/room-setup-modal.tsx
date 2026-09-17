import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Modal, Select, type SelectProps } from '@mantine/core';
import {
  IconAlertCircle,
  IconChevronDown,
  IconDeviceFloppy,
  IconDoorExit,
  IconLanguage,
} from '@tabler/icons-react';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import { LANGUAGES, type LanguageCode } from '@/shared/config/languages';
import classes from './room-setup-modal.module.css';

/**
 * Ikkala tanlov (xona va til) uchun umumiy ko'rinish va xatti-harakat.
 * Qidiruv yo'q: input faqat o'qish uchun bo'ladi va planshetda
 * ekran klaviaturasi chiqmaydi (klaviatura ekranni siljitardi).
 */
const selectProps = (chevronClass: string): Partial<SelectProps> => ({
  searchable: false,
  inputMode: 'none',
  allowDeselect: false,
  rightSection: <IconChevronDown className={chevronClass} stroke={2} />,
  rightSectionPointerEvents: 'none',
  comboboxProps: {
    zIndex: 1000,
    offset: 6,
    shadow: 'md',
    // Ro'yxat doim pastga ochiladi — tepaga sakrab o'tmaydi
    position: 'bottom',
    middlewares: { flip: false, shift: false },
  },
  // O'lchamlar inline beriladi: Mantine ularni CSS o'zgaruvchilari
  // orqali elementga yozadi va klassdagi qiymatlar ishlamaydi.
  styles: {
    label: {
      fontSize: 'var(--fs-base)',
      fontWeight: 700,
      color: 'var(--ac-navy)',
      marginBottom: '0.8rem',
    },
    input: {
      height: '5.2rem',
      fontSize: 'var(--fs-md)',
      fontWeight: 600,
      color: 'var(--ac-navy)',
      borderRadius: '1rem',
      borderColor: '#d6e3f7',
      paddingInline: '1.4rem',
      paddingRight: '4.4rem',
    },
    section: { width: '4.4rem' },
    dropdown: { borderRadius: '1rem', padding: '0.6rem', border: '1px solid #d6e3f7' },
    option: {
      fontSize: 'var(--fs-base)',
      fontWeight: 600,
      color: 'var(--ac-navy)',
      padding: '1.1rem 1.2rem',
      borderRadius: '0.8rem',
    },
    empty: { fontSize: 'var(--fs-base)', padding: '1.1rem 1.2rem' },
  },
});

const languageOptions = LANGUAGES.map((item) => ({ value: item.code, label: item.label }));

export function RoomSetupModal() {
  const { t, i18n } = useTranslation();
  const {
    roomSetupOpen,
    settingsMode,
    needsRoomSetup,
    closeRoomSetup,
    saveRoom,
    room,
    rooms,
    roomsLoading,
    roomsError,
    refetchRooms,
  } = useTablet();
  const [value, setValue] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(i18n.resolvedLanguage ?? LANGUAGES[0].code);

  // Oyna har ochilganda joriy xona va til bilan boshlanadi
  useEffect(() => {
    if (!roomSetupOpen) return;
    setValue(room ? String(room.id) : null);
    setLanguage(i18n.resolvedLanguage ?? LANGUAGES[0].code);
  }, [roomSetupOpen, room, i18n.resolvedLanguage]);

  const options = (Array.isArray(rooms) ? rooms : []).map((item) => ({
    value: String(item.id),
    label: `${item.number} — ${item.name}`,
  }));

  const languageOnly = settingsMode === 'language';

  const handleSave = () => {
    // Til faqat "Saqlash" bosilganda qo'llanadi
    const applyLanguage = () => {
      if (language !== i18n.resolvedLanguage) void i18n.changeLanguage(language as LanguageCode);
    };

    // Natija ekranlarida: faqat til, joriy ekran o'z holicha qoladi
    if (languageOnly) {
      applyLanguage();
      closeRoomSetup();
      return;
    }

    const selected = rooms.find((item) => String(item.id) === value);
    if (!selected) return;
    applyLanguage();
    saveRoom(selected);
  };

  return (
    <Modal
      opened={roomSetupOpen}
      onClose={closeRoomSetup}
      withCloseButton={!needsRoomSetup}
      closeOnClickOutside={!needsRoomSetup}
      closeOnEscape={!needsRoomSetup}
      centered
      radius="1.6rem"
      size="44rem"
      padding="2.4rem"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      styles={{ close: { width: '3rem', height: '3rem' } }}
    >
      <div className={classes.body}>
        <div className={classes.iconWrap}>
          {languageOnly ? (
            <IconLanguage className={classes.icon} stroke={1.6} />
          ) : (
            <IconDoorExit className={classes.icon} stroke={1.6} />
          )}
          <span className={classes.iconBadge}>!</span>
        </div>

        <div className={classes.title}>
          {needsRoomSetup
            ? t('roomSetup.titleRequired')
            : languageOnly
              ? t('roomSetup.titleLanguage')
              : t('roomSetup.titleChange')}
        </div>
        <div className={classes.text}>
          {needsRoomSetup
            ? t('roomSetup.textRequired')
            : languageOnly
              ? t('roomSetup.textLanguage')
              : t('roomSetup.textChange')}
        </div>

        {!languageOnly && (
          <>
            {!roomsError && !roomsLoading && options.length === 0 && (
              <Alert className={classes.alert} color="orange" icon={<IconAlertCircle />}>
                {t('roomSetup.noRooms')}
                <Button size="xs" variant="light" color="orange" mt="0.8rem" onClick={refetchRooms}>
                  {t('common.retry')}
                </Button>
              </Alert>
            )}

            {roomsError && options.length === 0 && (
              <Alert
                className={classes.alert}
                color="red"
                icon={<IconAlertCircle />}
                title={t('roomSetup.loadError')}
              >
                <Button size="xs" variant="light" color="red" onClick={refetchRooms}>
                  {t('common.retry')}
                </Button>
              </Alert>
            )}

            <div className={classes.field}>
              <Select
                label={t('roomSetup.room')}
                placeholder={roomsLoading ? t('common.loading') : t('roomSetup.placeholder')}
                data={options}
                value={value}
                onChange={setValue}
                disabled={roomsLoading}
                {...selectProps(classes.chevron)}
              />
            </div>
          </>
        )}

        <div className={classes.field}>
          <Select
            label={t('common.language')}
            data={languageOptions}
            value={language}
            onChange={(next) => next && setLanguage(next)}
            {...selectProps(classes.chevron)}
          />
        </div>

        <Button
          className={classes.submit}
          fullWidth
          h="4.8rem"
          styles={{ root: { borderRadius: '1rem', fontSize: 'var(--fs-md)' } }}
          leftSection={<IconDeviceFloppy className={classes.submitIcon} />}
          disabled={!languageOnly && !value}
          onClick={handleSave}
        >
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  );
}
