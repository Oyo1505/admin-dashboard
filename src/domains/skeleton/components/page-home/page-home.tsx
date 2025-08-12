import React from 'react';
import MoviesHomeSectionSkeleton from '../movie-home-section/movie-home-section';
import SkeletonBox from '../box/box';

const PageSkeleton = () => {
  return (
    <div className="flex flex-col mt-6 gap-8">
      {/* Skeleton for Last Five Movies Section */}
      <div className="pt-14">
        <SkeletonBox className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
        <MoviesHomeSectionSkeleton /> {/* Carousel Skeleton */}
      </div>

      {/* Skeleton for Movies by Random Country */}
      <div>
        <SkeletonBox className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
        <MoviesHomeSectionSkeleton /> {/* Carousel Skeleton */}
      </div>

      {/* Skeleton for Movies by Random Genre */}
      <div>
        <SkeletonBox className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
        <MoviesHomeSectionSkeleton /> {/* Carousel Skeleton */}
      </div>

      {/* Skeleton for Director's Movies */}
      <div>
        <SkeletonBox className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
        <MoviesHomeSectionSkeleton /> {/* Carousel Skeleton */}
      </div>

      {/* Skeleton for Favorite Movies */}
      <div className="w-full bg-primary pb-6 pt-6">
        <SkeletonBox className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
        <MoviesHomeSectionSkeleton />
      </div>
    </div>
  );
};

export default PageSkeleton;
