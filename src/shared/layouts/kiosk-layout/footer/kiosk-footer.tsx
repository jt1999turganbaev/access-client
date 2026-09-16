import classes from './kiosk-footer.module.css';

export function KioskFooter() {
  return (
    <footer className={classes.footer}>
      <div className={classes.slogan}>
        <span className={classes.line} />
        <span className={classes.sloganText}>Raqamli imkoniyatlar — Yangi O‘zbekiston uchun</span>
        <span className={classes.line} />
      </div>
      <img className={classes.logo} src="/uzinfocom-logo.svg" alt="UZINFOCOM" />
    </footer>
  );
}
