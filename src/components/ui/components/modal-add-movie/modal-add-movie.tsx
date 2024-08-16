'use client'
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../button/button';
import { IMovie } from '@/models/movie/movie';
import { useLocale, useTranslations } from 'next-intl';
import { addMovieToDb, editMovieToDb } from '@/components/dashboard/action';
import countriesList from '@/shared/constants/countries';
import { languagesList } from '@/shared/constants/lang';

interface IMovieForm {
  title: string | undefined
  originalTitle: string | undefined
  titleJapanese: string | undefined
  titleEnglish: string | undefined
  link: string | undefined
  year: number
  genre: string | undefined
  trailer: string | undefined
  synopsis: string | undefined
  duration: number
  country: string | undefined
  langage: string | undefined
  subtitles: string[] 
  id: string | undefined
  idGoogleDive: string | undefined
}

const DialogAddMovie = ({movie, editMovie=false, setIsOpen}:{ movie:IMovie, editMovie?: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const t = useTranslations('AddMovie');
  const locale = useLocale()
  const [formData, setFormData] = React.useState<IMovieForm>({
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

  const  createMovie= async () => {
    const rawFormData = {
      title: formData.title,
      titleJapanese: formData.titleJapanese,
      titleEnglish: formData.titleEnglish,
      idGoogleDive: formData.idGoogleDive,
      releaseDate: Date.now(),
      subtitles: formData.subtitles,
      language  : formData.langage,
      originalTitle: formData.originalTitle,
      year: formData.year,
      duration : formData.duration,
      genre: formData?.genre?.split(' '),
      country: formData.country,
      synopsis: formData.synopsis,
      trailer: formData.trailer,
      link: formData.link,
    }
    await addMovieToDb(rawFormData)
    setIsOpen(false)
  }
 
  const onClickEditMovie = async () => {
    console.log(formData)
    const rawFormData = {
      id: formData.id,
      idGoogleDive: formData.idGoogleDive,
      originalTitle: formData.originalTitle,
      title: formData.title,
      titleEnglish: formData.titleEnglish,
      titleJapanese: formData.titleJapanese,
      language  : formData.langage, 
      releaseDate: Date.now(),
      year: formData.year,
      duration : formData.duration,
      genre: formData?.genre?.split(' '),
      country: formData.country,
      synopsis: formData.synopsis,
      trailer: formData.trailer,
      link: formData.link,
      subtitles: formData.subtitles,
    }
     await editMovieToDb(rawFormData as any)
     setIsOpen(false)
  }
  const handleSubtitlesArray = (value: string) => {
    if (formData?.subtitles.includes(value)) {
      const newArray = formData?.subtitles.filter(item => item !== value);
      setFormData({ ...formData, subtitles: newArray });
    }
  }
  function onChangeCountry(e: any) {
    setFormData({...formData, country: e.target.value});
  }
  function onChangeLangage(e: any) {
    setFormData({...formData, langage: e.target.value});
  }
  
return(
    <Dialog.Portal>
      <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <Dialog.Title>FIlm</Dialog.Title>
      <Dialog.Description>Tesxt</Dialog.Description>
      <Dialog.Content className="data-[state=open]:animate-contentShow overflow-scroll text-background fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[950px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <form>
        <fieldset className="mb-[15px]  flex flex-col items-center gap-5">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="title">
          {t('titleMovie')}
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="title"
            required
            name='title'
            value={formData?.title?.trimStart().trimEnd()}
            onChange={(e) => {
              setFormData({...formData, title: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('originalTitle')}
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="originalTitle"
            required
            name='originalTitle'
            value={formData?.originalTitle}
            onChange={(e) => {
              setFormData({...formData, originalTitle: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('titleJapanese')}
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="titleJapanese"
       
            name='titleJapanese'
            value={formData?.titleJapanese}
            onChange={(e) => {
              setFormData({...formData, titleJapanese: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="originalTitle">
          {t('titleEnglish')}
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="titleEnglish"
    
            name='titleEnglish'
            value={formData?.titleEnglish}
            onChange={(e) => {
              setFormData({...formData, titleEnglish: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="link">
            {t('link')}
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="link"
            name='link'
            value={formData?.link}
            onChange={(e) => {
              setFormData({...formData, link: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="langage">
            {t('langage')}
          </label>
          <select  onChange={onChangeLangage} defaultValue={formData?.langage} className='text-background'>
              <option> </option>
            {languagesList.map((country, index) => (
                <option  key={`${
                //@ts-ignore
                country?.label?.[locale]}-${index}`} value={country?.value}>
                  {
                    //@ts-ignore
                  country?.label?.[locale]}
                </option>
              ))}
            </select>
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            {t('subtitles')}
          </label>
          <div className='flex gap-5 justify-center align-items'>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px]"
            id="subtitlesFR"
            name='subtitlesFR'
            type='checkbox'
            value={'FR'}
            checked={formData?.subtitles?.includes('FR')}
            onChange={(e) => {
              e.target.checked ? setFormData({...formData, subtitles: [...formData?.subtitles, e.target.value ]}) : handleSubtitlesArray(e.target.value)
           }}
          />
     
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            FR
          </label>
          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px]"
            id="subtitlesJP"
            name='subtitlesJP'
            type='checkbox'
            value={'JP'}
            checked={formData?.subtitles?.includes('JP')}
            onChange={(e) => {
              e.target.checked ? setFormData({...formData, subtitles: [...formData?.subtitles, e.target.value ]}) : handleSubtitlesArray(e.target.value)
           }}
          />
          <label className="text-violet11  text-right text-[15px]" htmlFor="subtitles">
            JP
          </label>

          <input
            className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px]"
            id="subtitlesEN"
            name='subtitlesEN'
            type='checkbox'
            value={'EN'}
            checked={formData?.subtitles?.includes('EN')}
            onChange={(e) => {
              e.target.checked ? setFormData({...formData, subtitles: [...formData?.subtitles, e.target.value ]}) : handleSubtitlesArray(e.target.value)
           }}
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
          <input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="year"
            type='number'
            name='year'
            value={formData?.year}
            min="1890" 
            max={new Date().getFullYear()}
            step="1" 
        
            onChange={(e) => {
              // Vérifier si la valeur saisie est un nombre valide et dans la plage définie
              const year = parseInt(e.target.value, 10);
              if (year >= 1900 && year <= 2100) {
                setFormData({ ...formData, year: Number(e.target.value)}); 
              }
            }}
      
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="genre">
          {t('genre')}
          </label>
          <input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="genre"
            name='genre'
            type='text'
            value={formData?.genre}
            onChange={(e) => {
              setFormData({...formData, genre: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="duration">
          {t('duration')}
          </label>
          <input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="duration"
            type='number'
            name='duration'
            value={formData?.duration}
            onChange={(e) => {
              setFormData({...formData, duration: Number(e.target.value)})
            }}
          />
        </fieldset>
        </div>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="trailer">
          {t('trailer')}
          </label>
          <input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="trailer"
            name='trailer'
            value={formData?.trailer}
            onChange={(e) => {
              setFormData({...formData, trailer: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11 text-right text-[15px]" htmlFor="synopsis">
          {t('synopsis')}
          </label>
          <textarea
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="synopsis"
            name='synopsis'
            value={formData?.synopsis}
            onChange={(e) => {
              setFormData({...formData, synopsis: e.target.value})
            }}
          />
        </fieldset>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
          <label className="text-violet11  text-right text-[15px]" htmlFor="country">
        {t('country')}
          </label>
          <select  onChange={onChangeCountry} defaultValue={formData?.country} className='text-background'>
              <option> </option>
            {countriesList.map((country, index) => (
                <option  key={`${
                //@ts-ignore
                country?.label?.[locale]}-${index}`} value={country?.value}>
                  {//@ts-ignore
                  country?.label?.[locale]}
                </option>
              ))}
            </select>
        </fieldset>
        {formData?.idGoogleDive && 
            <input
              className="text-violet11 hidden shadow-violet7 focus:shadow-violet8  h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
              id="idGoogleDive"
              type='hidden'
              name='idGoogleDive'
              value={formData?.idGoogleDive}
            />
          }
        <iframe src={`https://drive.google.com/file/d/${formData?.idGoogleDive}/preview`} width="100%" height="50" allow="autoplay"></iframe>
        <div className="mt-[25px] flex justify-end">
         
            <Button 
              size="sm"
              variant="outline"
              formAction={editMovie ? onClickEditMovie : createMovie}
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>

          </button>
        </Dialog.Close>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
)
}

export default DialogAddMovie