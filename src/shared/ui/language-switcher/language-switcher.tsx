import { Menu, Portal, UnstyledButton } from '@mantine/core';
import { IconChevronUp, IconWorld } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/shared/config/languages';
import classes from './language-switcher.module.css';

/**
 * Til tanlash menyusi — globus ikonkasi, joriy til nomi va strelka (access loyihasidagidek).
 * Ekranning pastki o'ng burchagida turadi (Sozlash tugmasiga qarama-qarshi).
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const current = LANGUAGES.find((item) => item.code === i18n.resolvedLanguage) ?? LANGUAGES[0];

  return (
    // Portal: tugma layout'ning stacking context'idan chiqariladi — footer ustida qoladi
    <Portal>
      <Menu position="top-end" offset={8} width="20rem" radius="1rem" shadow="md" zIndex={1000}>
        <Menu.Target>
          <UnstyledButton className={classes.target} aria-label={t('common.language')}>
            <IconWorld className={classes.icon} stroke={1.8} />
            <span>{current.label}</span>
            <IconChevronUp className={classes.chevron} stroke={2} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown className={classes.dropdown}>
          {LANGUAGES.map((language) => (
            <Menu.Item
              key={language.code}
              className={`${classes.item} ${language.code === current.code ? classes.active : ''}`}
              onClick={() => void i18n.changeLanguage(language.code)}
            >
              {language.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Portal>
  );
}
