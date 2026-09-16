import { useEffect, useState } from 'react';
import { Alert, Button, Modal, Select } from '@mantine/core';
import {
  IconAlertCircle,
  IconChevronDown,
  IconDeviceFloppy,
  IconDoorExit,
} from '@tabler/icons-react';
import { useTablet } from '@/features/tablet/tablet-context/tablet-context';
import classes from './room-setup-modal.module.css';

export function RoomSetupModal() {
  const {
    roomSetupOpen,
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

  useEffect(() => {
    if (roomSetupOpen) setValue(room ? String(room.id) : null);
  }, [roomSetupOpen, room]);

  const options = (Array.isArray(rooms) ? rooms : []).map((item) => ({
    value: String(item.id),
    label: `${item.number} — ${item.name}`,
  }));

  const handleSave = () => {
    const selected = rooms.find((item) => String(item.id) === value);
    if (selected) saveRoom(selected);
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
          <IconDoorExit className={classes.icon} stroke={1.6} />
          <span className={classes.iconBadge}>!</span>
        </div>

        <div className={classes.title}>
          {needsRoomSetup ? 'Xona biriktirilmagan!' : 'Xonani o‘zgartirish'}
        </div>
        <div className={classes.text}>
          {needsRoomSetup
            ? 'Ushbu planshet hozircha hech bir xonaga biriktirilmagan. Iltimos, xonani tanlab, saqlang.'
            : 'Planshet biriktiriladigan xonani tanlab, saqlang.'}
        </div>

        {!roomsError && !roomsLoading && options.length === 0 && (
          <Alert className={classes.alert} color="orange" icon={<IconAlertCircle />}>
            Serverda faol xona topilmadi. Administrator xona qo‘shgach, “Qayta urinish”ni bosing.
            <Button size="xs" variant="light" color="orange" mt="0.8rem" onClick={refetchRooms}>
              Qayta urinish
            </Button>
          </Alert>
        )}

        {roomsError && options.length === 0 && (
          <Alert
            className={classes.alert}
            color="red"
            icon={<IconAlertCircle />}
            title="Xonalar ro‘yxatini olib bo‘lmadi"
          >
            <Button size="xs" variant="light" color="red" onClick={refetchRooms}>
              Qayta urinish
            </Button>
          </Alert>
        )}

        <div className={classes.field}>
          <Select
            label="Xona"
            placeholder={roomsLoading ? 'Yuklanmoqda...' : 'Xonani tanlang'}
            data={options}
            value={value}
            onChange={setValue}
            /* Qidiruv yo'q: input faqat o'qish uchun bo'ladi va planshetda
               ekran klaviaturasi chiqmaydi (klaviatura ekranni siljitardi). */
            searchable={false}
            inputMode="none"
            allowDeselect={false}
            disabled={roomsLoading}
            rightSection={<IconChevronDown className={classes.chevron} stroke={2} />}
            rightSectionPointerEvents="none"
            comboboxProps={{
              zIndex: 1000,
              offset: 6,
              shadow: 'md',
              // Ro'yxat doim pastga ochiladi — tepaga sakrab o'tmaydi
              position: 'bottom',
              middlewares: { flip: false, shift: false },
            }}
            /* O'lchamlar inline beriladi: Mantine ularni CSS o'zgaruvchilari
               orqali elementga yozadi va klassdagi qiymatlar ishlamaydi. */
            styles={{
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
            }}
          />
        </div>

        <Button
          className={classes.submit}
          fullWidth
          h="4.8rem"
          styles={{ root: { borderRadius: '1rem', fontSize: 'var(--fs-md)' } }}
          leftSection={<IconDeviceFloppy className={classes.submitIcon} />}
          disabled={!value}
          onClick={handleSave}
        >
          Saqlash
        </Button>
      </div>
    </Modal>
  );
}
