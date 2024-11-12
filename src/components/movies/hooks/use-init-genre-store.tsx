import React, { useEffect, useState } from 'react'
import { getAllGenres } from '../action'
import { usePathname } from 'next/navigation';
import { set } from 'zod';
import { useGenreStore } from 'store/movie/movie-store';


const useInitGenreStore =  () => {
  const pathname = usePathname();

  const { genres: genresStore, setGenres} = useGenreStore();
  console.log(genresStore, 'hook')
  useEffect(() => {
    (async () => {
      if(genresStore && genresStore.length > 0 && pathname !== '/') return
      else if(genresStore && genresStore.length === 0 && pathname !== '/'){
        const { genres } = await getAllGenres()
        setGenres(genres)
      }
    })()
  }, [pathname, setGenres, genresStore])

  return genresStore
}

export default useInitGenreStore