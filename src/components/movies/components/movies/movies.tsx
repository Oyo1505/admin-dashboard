import React from 'react'
import Link from 'next/link'
import { URL_MOVIES } from '@/shared/route'
import Image from 'next/image'

interface IMovie {
  movies: any[]
}
 
const Movies = ({movies}:IMovie) => {

  return (
    <div className='mt-7'>
      <div className='flex flex-row gap-4 items-start flex-wrap justify-start'>
      {movies && movies?.length > 0 ? movies?.map((movie, index) => 
      <Link className='flex flex-col gap-3 justify-start items-center'
        key={`${movie?.title.toLowerCase().replaceAll(' ', '-')}-${index}`} 
        href={`${URL_MOVIES}/${movie?.title.toLowerCase().replaceAll(' ', '-')}`} >
          <Image className='object-fill' src={'https://fr.web.img6.acsta.net/img/f5/4c/f54c3310f101fe8ae4bba9e566bca1b5.jpg'} width={150} height={250} alt='movie' />
          {movie?.title} 
      </Link> ) : 'Pas de film disponible'}
      </div>
    </div>
  )
}

export default Movies