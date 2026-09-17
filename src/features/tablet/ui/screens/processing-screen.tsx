import { useTranslation } from 'react-i18next';
import { IdentityCircle, StatusHeading } from '@/shared/ui';
import classes from './screens.module.css';

export function ProcessingScreen() {
  const { t } = useTranslation();

  return (
    <div className={classes.center}>
      <IdentityCircle size={17} scanning />
      <StatusHeading
        title={t('processing.title')}
        accent={t('processing.accent')}
        accentColor="blue"
        subtitle={t('processing.subtitle')}
      />
    </div>
  );
}
