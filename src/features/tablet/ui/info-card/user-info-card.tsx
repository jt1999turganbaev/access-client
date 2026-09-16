import { IconUser } from '@tabler/icons-react';
import type { RecognizedUser } from '@/features/tablet/types';
import classes from './info-card.module.css';

export function UserInfoCard({ user }: { user: RecognizedUser }) {
  // F.I.O. — eng muhim maydon, alohida qatorda to'liq kenglikda (ism bo'linmasligi uchun)
  const fields = [
    { label: 'Lavozimi', value: user.position },
    { label: 'Xona', value: user.room },
    { label: 'Terminal', value: user.terminal },
  ].filter((field) => Boolean(field.value));

  return (
    <section className={classes.card}>
      <div className={classes.head}>
        <div className={classes.title}>Foydalanuvchi ma’lumotlari</div>
        <div className={classes.chip}>
          <IconUser className={classes.chipIcon} stroke={2} />
        </div>
      </div>
      <div className={classes.divider} />

      <div className={classes.nameRow}>
        <div className={classes.label}>F.I.O.</div>
        <div className={`${classes.value} ${classes.name}`}>{user.fullName}</div>
      </div>

      <div className={classes.grid}>
        {fields.map((field) => (
          <div className={classes.field} key={field.label}>
            <div className={classes.label}>{field.label}</div>
            <div className={classes.value}>{field.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
