import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useGenreStore } from 'store/movie/movie-store';
import { getAllGenres } from '../action';


const useInitGenreStore =  () => {
  const pathname = usePathname();
  const { genres: genresStore, setGenres} = useGenreStore();

  useEffect(() => {
    (async () => {
      if(genresStore && genresStore.length > 0 && pathname !== '/') return
      else if(genresStore && genresStore.length === 0 && pathname !== '/'){
        const { genres } = await getAllGenres()
        setGenres(genres ?? [])
      }
    })()
  }, [pathname, setGenres, genresStore])

  return genresStore
}

export default useInitGenreStore
