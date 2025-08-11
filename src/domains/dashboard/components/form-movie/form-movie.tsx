'use client'
import { addMovieToDb, editMovieToDb } from '@/domains/dashboard/action';
import SelectGenreMovieForm from '@/domains/movies/components/select-genre-movie-form/select-genre-movie-form';
import { Button } from '@/domains/ui/components/button/button';
import { Checkbox } from '@/domains/ui/components/checkbox/checkbox';
import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import LabelGenre from '@/domains/ui/components/label-genre/label-genre';
import SelectInput from '@/domains/ui/components/select/select';
import { Textarea } from '@/domains/ui/components/textarea/textarea';
import Title from '@/domains/ui/components/title/title';
import { IGenre, IMovie } from '@/models/movie/movie';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { FormDataMovieSchema, MovieSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'next-auth';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useGenreStore } from 'store/movie/movie-store';
import useUserStore from 'store/user/user-store';

const FormMovie = ({movie, editMovie = false, idFromGoogleDrive}:{ movie?:IMovie, editMovie?: boolean, idFromGoogleDrive?: string}) => {
  const t = useTranslations('AddMovie');
  const [genresMovie, setGenresMovie] = useState<IGenre[]>(movie && movie?.genresIds && movie?.genresIds?.length > 0 ? movie?.genresIds.map((item) => item.genre).flat() : [] as IGenre[]);
  const { genres } = useGenreStore();
  const router = useRouter();
  const { user } = useUserStore()
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id : movie?.id,
      title: movie?.title ?? '',
      originalTitle: movie?.originalTitle ?? '',
      titleJapanese: movie?.titleJapanese ?? '',
      titleEnglish: movie?.titleEnglish ?? '',
      director : movie?.director ?? '',
      imdbId : movie?.imdbId ?? '',
      publish : movie?.publish ?? true,
      link: movie?.link ?? '',
      year: movie?.year ?? new Date().getFullYear(),
      genresIds: genresMovie.map(item => item.id) ?? [],
      trailer: movie?.trailer ?? '',
      duration: movie?.duration ?? 0,
      synopsis: movie?.synopsis ?? '',
      country: movie?.country ?? '',
      langage: movie?.language ?? '',
      subtitles: movie?.subtitles ?? [],
      idGoogleDive: movie?.idGoogleDive ? movie?.idGoogleDive : idFromGoogleDrive ?? ""
    },
    resolver: zodResolver(FormDataMovieSchema)
  });

  const locale = useLocale();

  const [formData,] = useState<MovieSchema>({
    id : movie?.id ?? '',
    title: movie?.title ?? '',
    originalTitle: movie?.originalTitle ?? '',
    titleJapanese: movie?.titleJapanese ?? '',
    titleEnglish: movie?.titleEnglish ?? '',
    link: movie?.link ?? '',
    director : movie?.director ?? '',
    imdbId : movie?.imdbId ?? '',
    year: movie?.year ?? new Date().getFullYear(),
    genresIds : movie?.genresIds as unknown as string[] ?? [],
    trailer: movie?.trailer ?? '',
    duration: movie?.duration ?? 0,
    synopsis: movie?.synopsis ?? '',
    country: movie?.country ?? '',
    langage: movie?.language ?? '',
    subtitles: movie?.subtitles ?? [],
    idGoogleDive: idFromGoogleDrive ? idFromGoogleDrive : movie?.idGoogleDive ? movie?.idGoogleDive : ""
  });

  const createMovie = async (data : MovieSchema) => {
   try{
    const rawFormData = {
      title: data.title,
      titleJapanese: data.titleJapanese,
      titleEnglish: data.titleEnglish,
      idGoogleDive: data.idGoogleDive,
      director : data.director,
      imdbId : data.imdbId,
      subtitles: data.subtitles,
      language  : data.langage,
      originalTitle: data.originalTitle,
      genresIds: data?.genresIds,
      year: data.year,
      duration : data.duration,
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
    }

  const { status } = await addMovieToDb(rawFormData as unknown as IMovie, user as User)
  if(status === 200){
    toast.success(t('toastMovieMessageSuccess'), { position: "top-center" });
    router.push(URL_DASHBOARD_ROUTE.movie)
    return
  }
  return toast.error(t('toastMovieMessageSuccessDelete'), { position: "top-center" });
  }catch(err){
    console.log(err)
  }
  }

  const onClickEditMovie = async (data: MovieSchema) => {
    try{
    const rawFormData = {
      id: data.id,
      idGoogleDive: data.idGoogleDive,
      originalTitle: data.originalTitle,
      title: data.title,
      titleEnglish: data.titleEnglish,
      titleJapanese: data.titleJapanese,
      director : data.director,
      imdbId : data.imdbId,
      language  : data.langage,
      year: data.year,
      duration : data.duration,
      genresIds: data?.genresIds,
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
      subtitles: data.subtitles,
    }

     const { status } = await editMovieToDb(rawFormData as unknown as IMovie, user as User)
     if(status === 200){
       toast.success(t('toastMovieMessageSuccess'), { position: "top-center" });
       router.push(URL_DASHBOARD_ROUTE.movie)
       return
     }
     return toast.error(t('toastMovieMessageSuccessDelete'), { position: "top-center" });
     }catch(err){
      console.log(err, 'err')
    }
  }

  const subtitles = watch('subtitles', []);

  const handleCheckboxChange = (value : string) => {
    const newValue = subtitles.includes(value)
      ? subtitles.filter((item) => item !== value)
      : [...subtitles, value];

    setValue('subtitles', newValue);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('country', e.target.value);
  };
  const handleLangageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('langage', e.target.value);
  };

  const setGenresValue = (newGenresMovie: IGenre[]) => {
    const genresIds = newGenresMovie.map(item => item?.id);
    setValue('genresIds', genresIds);
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    if(genresMovie.find(item => item.id === e.target.value)) return

    const newGenreEntry =  genres?.find(item => item.id === e.target.value)
    const newGenresMovie = [...genresMovie, newGenreEntry].filter(
      (item): item is IGenre => item !== undefined
    );

    setGenresMovie(prevGenresMovie => {
      if (newGenreEntry && !prevGenresMovie.some(genre => genre.id === newGenreEntry.id)) {
        return [...prevGenresMovie, newGenreEntry];
      }
      return prevGenresMovie;
    });

    setGenresValue(newGenresMovie)
  };

  const handleGenreDelete = (id:string) => {
    const newGenresMovie = genresMovie.filter(item => item.id !== id)
    setGenresMovie(newGenresMovie)
    setGenresValue(newGenresMovie)
  }
  const langageSorted = languagesList.sort((a: {label: {fr: string, jp: string, en: string}}, b: {label: {fr: string, jp: string, en: string}}) => locale === 'fr' ? a.label.fr.localeCompare(b.label.fr) : locale === 'jp' ? a.label.jp.localeCompare(b.label.jp) : a.label.en.localeCompare(b.label.en))
return(
    <div className='bg-white'>
      <div className=" text-background p-3 ">
      <Title type='h1' textColor='text-background text-lg mb-3' translationTheme='AddMovie' translationText='title'/>
        <form onSubmit={handleSubmit(editMovie ? onClickEditMovie : createMovie)}>
        <div className="mb-[15px]  flex flex-col items-center gap-2">
          <LabelForm className="text-left w-full text-md" titleLabel={t('titleMovie')} htmlFor="title" />
          <Input
           className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
           {...register('title')}
          />
          {errors.title && <p className="text-red-600 text-xs">{errors.title.message}</p>}
        </div>

        <div className="mb-[15px] flex flex-col items-center gap-2">
        <LabelForm className="text-left w-full text-md" titleLabel={t('originalTitle')} htmlFor="originalTitle" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('originalTitle')}
          />
        </div>

        <div className="mb-[15px] flex flex-col items-center gap-2">
        <LabelForm className="text-left w-full text-md" titleLabel={t('titleJapanese')} htmlFor="titleJapanese" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('titleJapanese')}
          />
        </div>

        <div className="mb-[15px] flex flex-col items-center gap-5">
        <LabelForm className="text-left w-full text-md" titleLabel={t('titleEnglish')} htmlFor="titleEnglish" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('titleEnglish')}
          />
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
        <LabelForm className="text-left w-full text-md" titleLabel={t('director')} htmlFor="director" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            id="director"
            {...register('director')}
          />
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
          <LabelForm className="text-left w-full text-md" titleLabel={t('link')} htmlFor="link" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            id="link"
            {...register('link')}
          />
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
        <LabelForm className="text-left w-full text-md" titleLabel={t('imdbId')} htmlFor="imdbId" />
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            id="imdbId"
            {...register('imdbId')}
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('langage')} htmlFor="langage" />
            <SelectInput
              optionsList={langageSorted}
              formData={formData}
              formDataKey='langage'
              locale={locale}
              onChange={handleLangageChange}
            />
          </div>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('country')} htmlFor="country" />
            <SelectInput
              optionsList={countriesList}
              formData={formData}
              formDataKey='country'
              locale={locale}
              onChange={handleCountryChange}
            />
          </div>
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
          <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('genre')} htmlFor="genresIds" />
          <div className='inline-flex flex-wrap gap-2' >{genresMovie.length > 0 && genresMovie?.map(item => <LabelGenre key={item.id} nameFR={item.nameFR} nameEN={item.nameEN} nameJP={item.nameJP} onClick={() => handleGenreDelete(item.id)} locale={locale} />)}</div>
          <SelectGenreMovieForm
            optionsList={genres}
            locale={locale}
            onChange={handleGenreChange}
          />
          {errors.genresIds && <p className="text-red-600 text-xs">{errors.genresIds.message}</p>}
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
          <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('subtitles')} htmlFor="subtitles" />
          <div className='flex gap-5 justify-center align-items'>
          <Checkbox
            id="subtitlesFR"
            value={'FR'}
            {...register('subtitles')}
            checked={subtitles.includes('FR')}
            onChange={() => handleCheckboxChange('FR')}
          />
          <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={'FR'} htmlFor="subtitles" />

          <Checkbox
            id="subtitlesJP"
            value={'JP'}
            {...register('subtitles')}
            checked={subtitles.includes('JP')}
            onChange={() => handleCheckboxChange('JP')}
          />
          <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={'JP'} htmlFor="subtitles" />

          <Checkbox
            id="subtitlesEN"
            {...register('subtitles')}
            value="EN"
            checked={subtitles.includes('EN')}
            onChange={() => handleCheckboxChange('EN')}
          />
          <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={'EN'} htmlFor="subtitles" />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('year')} htmlFor="year" />
            <Input
              className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
              type='number'
              step="1"
              {...register('year', {
                required: 'L\'année est requis',
                min: { value: 1890, message: 'L\'année doit être supérieure à 1890' },
                max: { value: new Date().getFullYear(), message: 'L\'année ne peut pas être dans le futur' },
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="mb-[15px] flex flex-col items-center gap-5">
            <LabelForm className="text-violet11  text-right text-[15px]" titleLabel={t('duration')} htmlFor="duration" />
            <Input
              className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
              type='number'
              {...register('duration', {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>

        <div className="mb-[15px] flex flex-col items-center gap-5">
        <LabelForm className="text-left w-full text-md" titleLabel={t('trailer')} htmlFor="trailer" />
          <Input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('trailer')}
          />
        </div>
        <div className="mb-[15px] flex flex-col items-center gap-5">
        <LabelForm className="text-left w-full text-md" titleLabel={t('synopsis')} htmlFor="synopsis" />
          <Textarea
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
            {...register('synopsis')}
          />
        </div>

           <div className="mb-[15px] flex flex-col items-center gap-5">
           <LabelForm className="text-left w-full text-md" titleLabel={t('idGoogleDive')} htmlFor="idGoogleDive" />
            <Input
              type="text"
              className="text-violet11 shadow-violet7 focus:shadow-violet8  h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
              id="idGoogleDive"
              {...register('idGoogleDive')}
            />
          </div>


       {formData?.idGoogleDive && <iframe src={`https://drive.google.com/file/d/${formData?.idGoogleDive}/preview`} width="100%" height="150" allow="autoplay"/>}
        <div className="mt-[25px] flex justify-end">
            <Button
              size="sm"
              variant="outline"
              type='submit'
              className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-hidden"
            >
               {t('save')}
            </Button>
        </div>
        </form>
      </div>
    </div>
    )
}

export default FormMovie
