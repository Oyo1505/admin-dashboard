'use client';
import ButtonSearch from '@/domains/ui/components/button-search/button-search';
import { Locale } from '@/models/lang/lang';
import { IGenre } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { decades } from '@/shared/constants/decade';
import { URL_MOVIES } from '@/shared/route';
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated';
import { useFiltersMovieStore } from '@/store/movie/movie-store';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import qs from 'qs';
import { useEffect, useState } from 'react';
import SelectFilters from '../movie-filter_select-filters/movie-filter_select-filters';

const MovieFilters = ({
  subtitles,
  q,
  language,
  genres,
  genre,
  decadeParams,
  countries,
}: {
  subtitles?: string;
  language?: string;
  genres?: IGenre[];
  genre?: string;
  decadeParams?: number;
  q?: string;
  countries: string[];
}) => {
  const t = useTranslations('Filters');
  const [isClearing, setIsClearing] = useState(false);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { filters, setFiltersData, clearFilters } = useFiltersMovieStore();

  useEffect(() => {
    const hasUrlParams = subtitles || language || decadeParams || genre || q;
    if (hasUrlParams) {
      setFiltersData({
        subtitles: subtitles || undefined,
        language: language || undefined,
        decade: decadeParams || undefined,
        genre: genre || undefined,
        q: q || undefined,
      });
    }
  }, [subtitles, language, decadeParams, genre, q, setFiltersData]);

  const onChangeSubtitles = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltersData({ ...filters, subtitles: e.target.value });
  };

  const onChangeCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltersData({ ...filters, language: e.target.value });
  };

  const onChangeDecade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltersData({ ...filters, decade: Number(e.target.value) });
  };

  const onChangeGenre = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltersData({ ...filters, genre: e.target.value });
  };

  const onClick = () => {
    const queryString = qs.stringify({
      subtitles: filters?.subtitles || undefined,
      language: filters?.language || undefined,
      decade: filters?.decade || undefined,
      genre: filters?.genre || undefined,
      q: filters?.q || undefined,
    });
    router.replace(`${URL_MOVIES}?${queryString}`);
  };

  const onClickClearSearch = () => {
    clearFilters();
    router.replace(URL_MOVIES);
  };

  const listCountries = countriesList.filter((country) =>
    countries?.includes(country.value)
  );

  const genresSorted = genres?.sort(
    (
      a: { nameFR: string; nameJP: string; nameEN: string },
      b: { nameFR: string; nameJP: string; nameEN: string }
    ) =>
      locale === 'fr'
        ? a.nameFR.localeCompare(b.nameFR)
        : locale === 'jp'
          ? a.nameJP.localeCompare(b.nameJP)
          : a.nameEN.localeCompare(b.nameEN)
  );

  const subtitlesList = {
    EN: t('subtitlesEN'),
    JP: t('subtitlesJP'),
    FR: t('subtitlesFR'),
  };

  return (
    <div className="flex flex-col gap-9 md:gap-2 relative mt-6 w-full md:w-4/6 m-auto place-items-start justify-between">
      <div className="flex w-full flex-col md:flex-row flex-nowrap gap-2">
        <SelectFilters
          key="subtitles"
          titleLabel="subtitles"
          defaultValue={String(subtitles ?? filters?.subtitles)}
          onChange={onChangeSubtitles}
          filters={filters}
          filterKey="subtitles"
          isClearing={isClearing}
          displayedOptionValues={
            <>
              <option value="" disabled>
                {t('subtitles')}
              </option>
              {Object.entries(subtitlesList).map(([key, value], index) => (
                <option key={`${key}-${index}`} value={key}>
                  {value}
                </option>
              ))}
            </>
          }
        />
        <SelectFilters
          key="language"
          titleLabel="language"
          defaultValue={String(language ?? filters?.language)}
          onChange={onChangeCountry}
          filters={filters}
          filterKey="language"
          isClearing={isClearing}
          displayedOptionValues={
            <>
              <option value="" disabled>
                {t('language')}
              </option>
              {listCountries.map(
                (
                  language: {
                    label: { fr: string; jp: string; en: string };
                    value: string;
                  },
                  index: number
                ) => (
                  <option
                    key={`${language?.label?.[locale]}-${index}`}
                    value={language?.value}
                  >
                    {language?.label?.[locale]}
                  </option>
                )
              )}
            </>
          }
        />
        <SelectFilters
          titleLabel="decade"
          defaultValue={
            !decadeParams && !filters?.decade
              ? ''
              : String(decadeParams ?? filters?.decade)
          }
          onChange={onChangeDecade}
          filters={{ decade: filters?.decade }}
          filterKey="decade"
          isClearing={isClearing}
          displayedOptionValues={
            <>
              <option value="" disabled>
                {t('decade')}
              </option>
              {decades?.map((dec: number, index: number) => (
                <option key={`${dec}-${index}`} value={dec}>
                  {dec}
                </option>
              ))}
            </>
          }
        />
        <SelectFilters
          key={'genre'}
          titleLabel="genre"
          defaultValue={genre ?? filters?.genre}
          onChange={onChangeGenre}
          filters={filters}
          filterKey="genre"
          isClearing={isClearing}
          displayedOptionValues={
            <>
              <option value="" disabled>
                {t('genre')}
              </option>
              {genresSorted?.map(
                (
                  genre: {
                    id: string;
                    nameFR: string;
                    nameJP: string;
                    nameEN: string;
                  },
                  index: number
                ) => (
                  <option
                    key={`${genre.id}-${index}`}
                    value={displayGenreTranslated(genre, locale)}
                  >
                    {displayGenreTranslated(genre, locale)}
                  </option>
                )
              )}
            </>
          }
        />
      </div>
      <div className="flex w-full gap-1 box-border">
        <ButtonSearch
          className="w-full hover:cursor-pointer md:w-full lg:max-w-56 transition-all duration-300 bg-white text-background border-white border-1"
          btnText={t('btnSearch')}
          onClick={onClick}
        />
        <ButtonSearch
          className="w-full hover:cursor-pointer md:w-full lg:max-w-56 transition-all duration-300 bg-background text-white border-white border-1"
          btnText={t('btnClearSearch')}
          onClick={() => {
            setIsClearing(true);
            onClickClearSearch();
            setTimeout(() => setIsClearing(false), 100);
          }}
        />
      </div>
    </div>
  );
};

export default MovieFilters;
