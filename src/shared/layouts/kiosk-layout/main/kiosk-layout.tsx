import type { ReactNode } from 'react';
import { LanguageSwitcher } from '@/shared/ui';
import { KioskHeader } from '../header/kiosk-header';
import { KioskFooter } from '../footer/kiosk-footer';
import classes from './kiosk-layout.module.css';

export function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <div className={classes.root}>
      <div className={classes.bg} />

      <div className={classes.content}>
        <KioskHeader />
        <main className={classes.main}>{children}</main>
      </div>

      <KioskFooter />
      <LanguageSwitcher />
    </div>
  );
}
