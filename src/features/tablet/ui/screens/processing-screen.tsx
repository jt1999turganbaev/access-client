import { IdentityCircle, StatusHeading } from '@/shared/ui';
import classes from './screens.module.css';

export function ProcessingScreen() {
  return (
    <div className={classes.center}>
      <IdentityCircle size={28} scanning />
      <StatusHeading title="Yuz" accent="aniqlanmoqda" accentColor="blue" subtitle="Iltimos, kuting" />
    </div>
  );
}
