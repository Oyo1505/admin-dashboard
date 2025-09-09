import { memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const MoviesSkeleton = memo(() => {
  return (
    <>
      <div className="flex flex-row gap-4 mt-6 items-start flex-wrap justify-center lg:justify-start">
        {/* Skeletons for Movie Items */}
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className="w-52 group mb-5 flex h-full flex-col gap-3 justify-start items-center transition-all duration-300"
          >
            <div className="flex relative w-full rounded-lg flex-col justify-between h-full">
              {/* Skeleton for image */}
              <Skeleton
                height={288}
                width="100%"
                className="rounded-lg animate-shimmer"
              />
            </div>
            {/* Skeleton for movie title */}
            <Skeleton className="animate-shimmer" width="80%" height={24} />
          </div>
        ))}
      </div>
    </>
  );
});
MoviesSkeleton.displayName = 'MoviesSkeleton';
export default MoviesSkeleton;
