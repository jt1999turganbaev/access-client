import type { ReactNode } from 'react';
import classes from './status-heading.module.css';

interface Props {
  /** Sarlavhaning oddiy (navy) qismi */
  title: string;
  /** Rangli urg'u so'zi */
  accent?: string;
  accentColor?: 'blue' | 'green' | 'red';
  subtitle?: ReactNode;
  /** Natija ekranlari uchun kichikroq o'lcham */
  compact?: boolean;
}

const accentClass = {
  blue: classes.accentBlue,
  green: classes.accentGreen,
  red: classes.accentRed,
};

export function StatusHeading({ title, accent, accentColor = 'blue', subtitle, compact }: Props) {
  return (
    <div className={`${classes.wrap} ${compact ? classes.compact : ''}`}>
      <h1 className={classes.title}>
        {title}
        {accent && <span className={accentClass[accentColor]}> {accent}</span>}
      </h1>
      {subtitle && <div className={classes.subtitle}>{subtitle}</div>}
    </div>
  );
}
