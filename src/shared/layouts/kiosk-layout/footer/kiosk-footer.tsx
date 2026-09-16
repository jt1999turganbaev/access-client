import { useTranslation } from 'react-i18next';
import classes from './kiosk-footer.module.css';

export function KioskFooter() {
  const { t } = useTranslation();

  return (
    <footer className={classes.footer}>
      <div className={classes.slogan}>
        <span className={classes.line} />
        <span className={classes.sloganText}>{t('footer.slogan')}</span>
        <span className={classes.line} />
      </div>
      <img className={classes.logo} src="/uzinfocom-logo.svg" alt="UZINFOCOM" />
    </footer>
  );
}
