import FromSelectInput from '@/domains/shared/components/form-select-input/form-select-input';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import { useTranslations } from 'next-intl';

interface IFormMovieSelects {
  locale: string;
  formData: any;
  handleCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleLangageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FormMovieSelects = ({
  locale,
  formData,
  handleCountryChange,
  handleLangageChange,
}: IFormMovieSelects) => {
  const t = useTranslations('AddMovie');
  const langageSorted = languagesList.sort(
    (
      a: { label: { fr: string; jp: string; en: string } },
      b: { label: { fr: string; jp: string; en: string } }
    ) =>
      locale === 'fr'
        ? a.label.fr.localeCompare(b.label.fr)
        : locale === 'jp'
          ? a.label.jp.localeCompare(b.label.jp)
          : a.label.en.localeCompare(b.label.en)
  );

  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">{t('languageAndCountry')}</legend>
      <div className="grid grid-cols-2 gap-3">
      <FromSelectInput
        optionsList={langageSorted}
        formData={formData}
        formDataKey="langage"
        titleLabel={t('langage')}
        htmlFor="langage"
        locale={locale}
        onChange={handleLangageChange}
      />
      <FromSelectInput
        optionsList={countriesList}
        formData={formData}
        formDataKey="country"
        titleLabel={t('country')}
        htmlFor="country"
        locale={locale}
        onChange={handleCountryChange}
      />
      </div>
    </fieldset>
  );
};

export default FormMovieSelects;
