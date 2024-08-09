'use client'
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../button/button';
import { IMovie } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import { addMovieToDb, editMovieToDb } from '@/components/dashboard/action';

const DialogAddMovie = ({movie, editMovie=false, setIsOpen}:{ movie:IMovie, editMovie?: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const t = useTranslations('AddMovie');

  const [formData, setFormData] = React.useState<any>({
    id : movie?.id,
    title: movie?.title ?? '',
    originalTitle: movie?.originalTitle ?? '',
    link: movie?.link ?? '', 
    year: movie?.year ?? new Date().getFullYear(), 
    genre: movie?.genre?.join(' ') ?? '', 
    trailer: movie?.trailer ?? '', 
    duration: movie?.duration ?? 0,
    synopsis: movie?.synopsis ?? '', 
    country: movie?.country ?? '', 
    idGoogleDive: movie?.idGoogleDive ? movie?.idGoogleDive : movie?.id ?? ""
  });

  const  createMovie= async () => {
    const rawFormData = {
      title: formData.title,
      idGoogleDive: formData.idGoogleDive,
      releaseDate: Date.now(),
      originalTitle: formData.originalTitle,
      year: formData.year,
      duration : formData.duration,
      genre: formData.genre.split(' '),
      country: formData.country,
      synopsis: formData.synopsis,
      trailer: formData.trailer,
      link: formData.link,
    }
    await addMovieToDb(rawFormData)
    setIsOpen(false)
  }
 
  const onClickEditMovie = async () => {
    const rawFormData = {
      id: formData.id,
      idGoogleDive: formData.idGoogleDive,
      originalTitle: formData.originalTitle,
      title: formData.title,
      releaseDate: Date.now(),
      year: formData.year,
      duration : formData.duration,
      genre: formData?.genre?.split(' '),
      country: formData.country,
      synopsis: formData.synopsis,
      trailer: formData.trailer,
      link: formData.link,
    }
     await editMovieToDb(rawFormData as any)
     setIsOpen(false)
  }

return(
    <Dialog.Portal>
      <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <Dialog.Title>FIlm</Dialog.Title>
      <Dialog.Description>Tesxt</Dialog.Description>
      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <form>
        <fieldset className="mb-[15px] flex flex-col items-center gap-5">
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
            value={formData?.originalTitle?.trimStart().trimEnd()}
            onChange={(e) => {
              setFormData({...formData, originalTitle: e.target.value})
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
                setFormData({ ...formData, year: e.target.value });
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
              setFormData({...formData, duration: e.target.value})
            }}
          />
        </fieldset>
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
          <input
            className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            id="country"
            name='country'
            value={formData?.country}
            onChange={(e) => {
              setFormData({...formData, country: e.target.value})
            }}
          />
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