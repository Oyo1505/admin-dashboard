"use client"
import { URL_MOVIES } from '@/shared/route'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useFiltersMovieStore } from 'store/movie/movie-store'

const useClearFiltersData = () => {
  const {filters, setFiltersData} = useFiltersMovieStore(state => state);
  const pathname = usePathname();
  useEffect(() => {
    if(pathname !== URL_MOVIES && ( filters?.q && filters?.q?.length > 0 || filters?.language && filters?.language?.length > 0 || filters?.subtitles && filters?.subtitles?.length > 0 || filters?.genre && filters?.genre?.length > 0)){
      if (Object.keys(filters).length > 0) {
        setFiltersData({subtitles: "", language: "", genre: "", q: ""});
      }
    }
  }, [pathname, filters, setFiltersData])
}

export default useClearFiltersData