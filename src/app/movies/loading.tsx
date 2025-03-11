import MoviesSkeleton from '@/domains/skeleton/components/movies-skeleton/movies-skeleton';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Loading = () =>{
  return (
    <>
      {/* Skeleton for SearchMovie */}
      <div className="mt-6 w-4/6 m-auto">
        <Skeleton height={40} className='mb-4 animate-shimmer'/>
      </div>

      {/* Skeleton for MovieFilters */}
      <div className="flex w-4/6 m-auto flex-col md:flex-row gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="flex flex-col gap-2 md:w-64" key={index}>
            <Skeleton height={20} className="mb-2 animate-shimmer" />
            <Skeleton height={40} className='animate-shimmer'/>
          </div>
        ))}
      </div>

      {/* Skeleton for Movies Section */}
      <MoviesSkeleton />
      
      {/* Skeleton for Load More Button */}
      <div className='flex justify-center mt-10'>
        <Skeleton className='animate-shimmer' width={120} height={40} />
      </div>
    </>
  );
}

export default Loading