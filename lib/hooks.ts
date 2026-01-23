'use client';

import { useCallback } from 'react';
import { useAppStore } from './store';
import { i18n, I18nKey } from './i18n';

export function useTranslation() {
  const { lang, config } = useAppStore();

  const t = useCallback(
    (key: string): string => {
      let text: string = i18n[lang][key as I18nKey] || key;
      text = text.replace('{lock}', String(config.lockDays));
      text = text.replace('{rate}', String(config.initialRate * 100));
      text = text.replace('{linear}', String(config.linearDays));
      return text;
    },
    [lang, config]
  );

  return { t, lang };
}
