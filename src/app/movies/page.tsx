import Movies from '@/components/movies/components/movies/movies'
import SearchMovie from '@/components/movies/components/search-movie/search-movie'
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import React, { Suspense } from 'react'

 const Page  = async ({
  searchParams
}: {
  searchParams: { q: string; offset: string };
})=> {
 
  return (<>
    <SearchMovie  />
    <Suspense fallback={<LoadingSpinner />}>
    <Movies searchParams={searchParams}  />
    </Suspense>
    </>
)
}


export default Page