import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { formatDate, formatTime, formatWeekday } from '@/shared/utils';

export function useClock() {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    now,
    time: formatTime(now),
    date: formatDate(now),
    weekday: formatWeekday(now),
  };
}
