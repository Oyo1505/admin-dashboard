'use client';
import ButtonSearch from '@/domains/ui/components/button-search/button-search';
import { Locale } from '@/models/lang/lang';
import { IGenre } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { decades } from '@/shared/constants/decade';
import displayGenreTranslated from '@/shared/utils/string/displayGenreTranslated';
import { useMovieFormStore } from '@/store/movie/movie-store';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useState } from 'react';
import useMovieFilters from '../../hooks/use-movie-filters';
import SelectFilters from '../movie-filter_select-filters/movie-filter_select-filters';

const MovieFilters = ({
  subtitles,
  q,
  language,
  genres,
  genre,
  offset,
  decadeParams,
  countries,
}: {
  subtitles?: string;
  language?: string;
  genres?: IGenre[];
  genre?: string;
  offset: number;
  decadeParams?: number;
  q?: string;
  countries: string[];
}) => {
  const t = useTranslations('Filters');
  const [isMounted, setIsMounted] = useState(false);
  const { setMoviesStore } = useMovieFormStore();
  const locale = useLocale() as Locale;
  const {
    onChangeSubtitles,
    onChangeCountry,
    onChangeDecade,
    onChangeGenre,
    filters,
    setFiltersData,
    setHasBeenSearched,
    hasBeenSearched,
    onClick,
    onClickClearSearch,
    queryFilterSearch,
  } = useMovieFilters({ offset });

  const { data, status, refetch } = queryFilterSearch;

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (
      isMounted &&
      (genre !== '' ||
        language !== '' ||
        subtitles !== '' ||
        q !== '' ||
        (decadeParams && decadeParams > 0))
    ) {
      setFiltersData({
        ...filters,
        genre,
        language,
        subtitles,
        decade: decadeParams,
        q,
      });
      if (isMounted === true) {
        setIsMounted(false);
        refetch();
      }
    }
  }, [
    filters,
    setFiltersData,
    isMounted,
    genre,
    language,
    refetch,
    status,
    subtitles,
    decadeParams,
    q,
  ]);

  useEffect(() => {
    if (hasBeenSearched) {
      refetch();
      setHasBeenSearched(false);
    }
  }, [hasBeenSearched, setHasBeenSearched, refetch]);

  useEffect(() => {
    if (data && data?.movies && status === 'success') {
      setMoviesStore(data?.movies);
    }
  }, [data, setMoviesStore, status]);

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
          onClick={onClickClearSearch}
        />
      </div>
    </div>
  );
};

export default MovieFilters;
