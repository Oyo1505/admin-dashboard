'use client'
import { deleteGenre } from '@/domains/movies/action'
import { IGenre } from '@/models/movie/movie'
import { useLocale } from 'next-intl'

export const GenreItem = ({item}:{item:IGenre}) => {
  const { nameFR, nameEN, nameJP } = item
  const locale = useLocale()
  const onDelete = async () => {
    try {
      await deleteGenre(item.id)
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='text-black rounded-sm pr-4 pl-2 relative bg-primary text-center  min-w-16 '>{locale === 'fr' ? nameFR : locale === 'en' ? nameEN : nameJP} <span onClick={onDelete} className='text-xs absolute top-0 right-1 hover:cursor-pointer'>x</span></div>
  )
}
