'use client'
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../button/button';
import { IMovie } from '@/models/movie/movie';
import { useLocale, useTranslations } from 'next-intl';
import { addMovieToDb, editMovieToDb } from '@/components/dashboard/action';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';
import { CrossIcon } from '../icons/icons';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { Checkbox } from '../checkbox/checkbox';
import SelectInput from '../select/select';
import { FormDataMovieSchema, MovieSchema } from '@/shared/schema/movieSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const DialogAddMovie = ({movie, editMovie=false, setIsOpen}:{ movie:IMovie, editMovie?: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const t = useTranslations('AddMovie');
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
      link: movie?.link ?? '',  
      year: movie?.year ?? new Date().getFullYear(), 
      genre: movie?.genre?.join(' ') ?? '', 
      trailer: movie?.trailer ?? '', 
      duration: movie?.duration ?? 0,
      synopsis: movie?.synopsis ?? '', 
      country: movie?.country ?? '',
      langage: movie?.language ?? '',
      subtitles: movie?.subtitles ?? [],
      idGoogleDive: movie?.idGoogleDive ? movie?.idGoogleDive : movie?.id ?? ""
    },
    resolver: zodResolver(FormDataMovieSchema)
  });
  const locale = useLocale()
  const [formData, setFormData] = React.useState<MovieSchema>({
    id : movie?.id,
    title: movie?.title ?? '',
    originalTitle: movie?.originalTitle ?? '',
    titleJapanese: movie?.titleJapanese ?? '',
    titleEnglish: movie?.titleEnglish ?? '',
    link: movie?.link ?? '',  
    year: movie?.year ?? new Date().getFullYear(), 
    genre: movie?.genre?.join(' ') ?? '', 
    trailer: movie?.trailer ?? '', 
    duration: movie?.duration ?? 0,
    synopsis: movie?.synopsis ?? '', 
    country: movie?.country ?? '',
    langage: movie?.language ?? '',
    subtitles: movie?.subtitles ?? [],
    idGoogleDive: movie?.idGoogleDive ? movie?.idGoogleDive : movie?.id ?? ""
  });
  
  const  createMovie= async (data : MovieSchema) => {
    const rawFormData = {
      title: data.title,
      titleJapanese: data.titleJapanese,
      titleEnglish: data.titleEnglish,
      idGoogleDive: data.idGoogleDive,
      releaseDate: Date.now(),
      subtitles: data.subtitles,
      language  : data.langage,
      originalTitle: data.originalTitle,
      year: data.year,
      duration : data.duration,
      genre: data?.genre?.split(' '),
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
    }
    await addMovieToDb(rawFormData)
    setIsOpen(false)
  }
 
  const onClickEditMovie = async ( data: MovieSchema) => {
      
    const rawFormData = {
      id: data.id,
      idGoogleDive: data.idGoogleDive,
      originalTitle: data.originalTitle,
      title: data.title,
      titleEnglish: data.titleEnglish,
      titleJapanese: data.titleJapanese,
      language  : data.langage, 
      releaseDate: Date.now(),
      year: data.year,
      duration : data.duration,
      genre: data?.genre?.split(' '),
      country: data.country,
      synopsis: data.synopsis,
      trailer: data.trailer,
      link: data.link,
      subtitles: data.subtitles,
    }

     await editMovieToDb(rawFormData as any)
     setIsOpen(false)
  }

  const subtitles = watch('subtitles', []);
  const idGoogleDive = watch('idGoogleDive', '');
  const handleCheckboxChange = (value : string) => {
    const newValue = subtitles.includes(value)
      ? subtitles.filter((item) => item !== value)
      : [...subtitles, value];

    setValue('subtitles', newValue); 
  };


return(
    <Dialog.Portal>
      <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <Dialog.Title>FIlm</Dialog.Title>
      <Dialog.Description>Tesxt</Dialog.Description>
      <Dialog.Content className="data-[state=open]:animate-contentShow overflow-scroll text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[950px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <form onSubmit={handleSubmit(editMovie ? onClickEditMovie : createMovie)}>
        <fieldset className="mb-[15px]  flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="title">
          {t('titleMovie')}
          </label>
          <Input
           className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
           {...register('title')}
          />
          {errors.title && <p className="text-red-600 text-xs">{errors.title.message}</p>}
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('originalTitle')}
          </label>
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('originalTitle')}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('titleJapanese')}
          </label>
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('titleJapanese')}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('titleEnglish')}
          </label>
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('titleEnglish')}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="link">
            {t('link')}
          </label>
          <Input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="link"
            {...register('link')}
          />
        </fieldset>
        <div className='grid grid-cols-2 gap-3'>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="langage">
            {t('langage')}
          </label>
          <SelectInput 
            optionsList={languagesList} 
            formData={formData} 
            formDataKey='langage' 
            locale={locale} 
            onChange={(e) => {
              setFormData({...formData, langage: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="country">
        {t('country')}
          </label>
          <SelectInput 
            optionsList={countriesList} 
            formData={formData} 
            formDataKey='country' 
            locale={locale} 
            onChange={(e) => {
              setFormData({...formData, country: e.target.value})
            }}
          />
        </fieldset>
        </div>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            {t('subtitles')}
          </label>
          <div className='flex gap-5 justify-center align-items'>
          <Checkbox
            id="subtitlesFR"
            value={'FR'}
            {...register('subtitles')}
            checked={subtitles.includes('FR')}
            onChange={() => handleCheckboxChange('FR')}
          />
     
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            FR
          </label>
          <Checkbox
            id="subtitlesJP"
            value={'JP'}
            {...register('subtitles')}
            checked={subtitles.includes('JP')}
            onChange={() => handleCheckboxChange('JP')}
          />
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            JP
          </label>

          <Checkbox
            id="subtitlesEN"
            {...register('subtitles')}
            value="EN"
            checked={subtitles.includes('EN')}
            onChange={() => handleCheckboxChange('EN')}
          />
             <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            EN
          </label>
          </div>
        </fieldset>
       
        <div className='grid grid-cols-3 gap-3'>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="year">
          {t('year')}
          </label>
          <Input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            type='number'
            step="1" 
            {...register('year', {
              required: 'L\'année est requis',
              min: { value: 1890, message: 'L\'année doit être supérieure à 1890' },
              max: { value: new Date().getFullYear(), message: 'L\'année ne peut pas être dans le futur' },
              setValueAs: (value) => value === '' ? undefined : parseInt(value, 10),
            })}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="genre">
          {t('genre')}
          </label>
          <Input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('genre')}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="duration">
          {t('duration')}
          </label>
          <Input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            type='number'
            {...register('duration')}
          />
        </fieldset>
        </div>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="trailer">
          {t('trailer')}
          </label>
          <Input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('trailer')}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="synopsis">
          {t('synopsis')}
          </label>
          <Textarea
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            {...register('synopsis')}
          />
        </fieldset>

        {idGoogleDive && 
            <Input
              className="text-violet11 hidden shadow-violet7 focus:shadow-violet8  h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
              id="idGoogleDive"
              type='hidden'
              {...register('idGoogleDive')}
            />
          }

        <iframe src={`https://drive.google.com/file/d/${idGoogleDive}/preview`} width="100%" height="150" allow="autoplay"/>

        <div className="mt-[25px] flex justify-end">
         
            <Button 
              size="sm"
              variant="outline"
              type='submit'
              // formAction={editMovie ? onClickEditMovie : createMovie}
              className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
            >
               {t('save')}
            </Button> 
            
        </div>
        <Dialog.Close asChild>
          <button
            className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
            aria-label="Close"
          >
          <CrossIcon  color='black'/>
          </button>
        </Dialog.Close>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
    )
}

export default DialogAddMovie