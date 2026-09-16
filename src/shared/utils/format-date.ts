import dayjs from 'dayjs';
import { i18n } from '@/shared/config/i18n';

/** Oy va hafta kuni nomlari joriy tildagi tarjimalardan olinadi */
const names = (key: 'date.months' | 'date.weekdays') => {
  const list = i18n.t(key, { returnObjects: true });
  return Array.isArray(list) ? (list as string[]) : [];
};

export function formatDate(value: dayjs.Dayjs | string | Date) {
  const d = dayjs(value);
  return i18n.t('date.format', {
    day: d.date(),
    month: names('date.months')[d.month()] ?? d.format('MM'),
    year: d.year(),
  });
}

export function formatWeekday(value: dayjs.Dayjs | string | Date) {
  return names('date.weekdays')[dayjs(value).day()] ?? '';
}

export function formatTime(value: dayjs.Dayjs | string | Date, withSeconds = false) {
  return dayjs(value).format(withSeconds ? 'HH:mm:ss' : 'HH:mm');
}
