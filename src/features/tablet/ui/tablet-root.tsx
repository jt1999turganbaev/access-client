import { Outlet } from 'react-router-dom';
import { useAccessEvents } from '@/features/tablet/hooks/use-access-events';
import { TabletProvider } from '@/features/tablet/tablet-context/tablet-provider';
import { KioskLayout } from '@/shared/layouts/kiosk-layout/main/kiosk-layout';
import { RoomSetupModal } from './room-setup-modal/room-setup-modal';
import { SettingsButton } from './settings-button/settings-button';

/** SSE tinglovchisi `TabletProvider` ichida bo'lishi shart — alohida komponent. */
function AccessEventsListener() {
  useAccessEvents();
  return null;
}

/**
 * Barcha ekranlar uchun umumiy qobiq: planshet holati, SSE ulanishi,
 * kiosk maketi, xona sozlash oynasi va dev panel.
 */
export function TabletRoot() {
  return (
    <TabletProvider>
      <AccessEventsListener />
      <KioskLayout>
        <Outlet />
        <SettingsButton />
        <RoomSetupModal />
      </KioskLayout>
    </TabletProvider>
  );
}
