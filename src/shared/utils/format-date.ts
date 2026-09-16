import dayjs from 'dayjs';

const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

export function formatDate(value: dayjs.Dayjs | string | Date) {
  const d = dayjs(value);
  return `${d.date()}-${MONTHS[d.month()]}, ${d.year()}`;
}

export function formatWeekday(value: dayjs.Dayjs | string | Date) {
  return WEEKDAYS[dayjs(value).day()];
}

export function formatTime(value: dayjs.Dayjs | string | Date, withSeconds = false) {
  return dayjs(value).format(withSeconds ? 'HH:mm:ss' : 'HH:mm');
}
