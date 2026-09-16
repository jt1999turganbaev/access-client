import { IconClipboardList } from '@tabler/icons-react';
import type { TaskItem } from '@/features/tablet/types';
import classes from './info-card.module.css';

/** Matn uzun bo'lsa shrift biroz kichrayadi — vazifa scrollsiz sig'ishi uchun */
const LONG_TEXT = 140;

export function TaskCard({ tasks }: { tasks?: TaskItem[] | null }) {
  // Ro'yxat kelmasligi yoki bo'sh elementlar bo'lishi mumkin; nomi ko'rsatilmaydi — faqat matni
  const items = (Array.isArray(tasks) ? tasks : []).filter((task) => task?.description);
  const totalLength = items.reduce((sum, task) => sum + (task.description?.length ?? 0), 0);
  const compact = totalLength > LONG_TEXT;

  return (
    <section className={`${classes.card} ${classes.cardGrow}`}>
      <div className={classes.head}>
        <div className={classes.headLeft}>
          <div className={`${classes.chip} ${classes.chipGreen}`}>
            <IconClipboardList className={classes.chipIcon} stroke={2} />
          </div>
          <div className={classes.title}>
            {items.length > 1 ? 'Sizning vazifalaringiz' : 'Sizning vazifangiz'}
          </div>
        </div>
        {items.length > 0 && <div className={classes.badge}>{items.length} ta</div>}
      </div>
      <div className={classes.divider} />

      {items.length === 0 ? (
        <div className={classes.empty}>Bugungi kun uchun vazifa biriktirilmagan.</div>
      ) : (
        <div className={classes.tasks}>
          {items.map((task, index) => (
            <div className={classes.task} key={task.id ?? index}>
              {items.length > 1 && <div className={classes.taskIndex}>{index + 1}</div>}
              <div className={`${classes.taskText} ${compact ? classes.taskTextCompact : ''}`}>
                {task.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
