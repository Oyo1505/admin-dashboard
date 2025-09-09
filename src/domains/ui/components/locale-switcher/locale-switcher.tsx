import { useLocale, useTranslations } from 'next-intl';
import { memo } from 'react';
import LocaleSwitcherSelect from '../locale-switcher-select/locale-switcher-select';

export default memo(function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: 'en',
          label: t('en'),
        },
        {
          value: 'fr',
          label: t('fr'),
        },
        {
          value: 'jp',
          label: t('jp'),
        },
      ]}
      label={t('HomePage')}
    />
  );
});
