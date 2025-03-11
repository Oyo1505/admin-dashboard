import React from 'react';
import Container from '@/domains/ui/components/container/container';
import SkeletonBox from '../box/box';

const MoviesHomeThemeSkeleton = () => {
  return (
    <div className="w-full aspect-[0/0.4] md:aspect-[1/0.4] relative bg-gray-200 animate-pulse">
      <div className="absolute w-full h-full bg-slate-950 opacity-50 top-0 left-0 z-0"></div>
      <Container className="h-full pt-6 pb-6 flex relative flex-col justify-start items-start">
        {/* Skeleton for the Title */}
        <SkeletonBox className="h-10 w-48 animate-shimmer md:h-16 md:w-64 mb-4" />
        
        <div className="h-full flex flex-wrap justify-start items-end gap-2">
          {/* Skeletons for Movie Items (non-mobile view) */}
          {[...Array(4)].map((_, index) => (
            <SkeletonBox key={index} className="w-28 h-40 animate-shimmer bg-gray-200 md:w-40 md:h-56" />
          ))}
        </div>

        {/* Skeletons for Mobile View (Carousel) */}
        <div className="w-full mt-6 block md:hidden">
          <div className="w-full flex gap-4 overflow-x-auto">
            {[...Array(3)].map((_, index) => (
              <SkeletonBox key={index} className="w-28 h-40 animate-shimmer bg-gray-200" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MoviesHomeThemeSkeleton;
