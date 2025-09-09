import { memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const FiltersSkeleton = memo(() => {
  return (
    <div className="flex flex-col gap-9 md:gap-2 relative mt-6 w-4/6 m-auto place-items-start justify-between">
      <div className="flex w-full flex-col md:flex-row flex-nowrap gap-2">
        {/* Skeleton for Subtitles Filter */}
        <div className="flex flex-col gap-2 md:w-64">
          <Skeleton className="animate-shimmer" width={80} height={20} />
          <Skeleton className="animate-shimmer" width="100%" height={40} />
        </div>

        {/* Skeleton for Language Filter */}
        <div className="flex flex-col gap-2 md:w-64">
          <Skeleton className="animate-shimmer" width={80} height={20} />
          <Skeleton className="animate-shimmer" width="100%" height={40} />
        </div>

        {/* Skeleton for Decade Filter */}
        <div className="flex flex-col gap-2 md:w-64">
          <Skeleton className="animate-shimmer" width={80} height={20} />
          <Skeleton className="animate-shimmer" width="100%" height={40} />
        </div>

        {/* Skeleton for Genre Filter */}
        <div className="flex flex-col gap-2 md:w-64">
          <Skeleton className="animate-shimmer" width={80} height={20} />
          <Skeleton className="animate-shimmer" width="100%" height={40} />
        </div>
      </div>

      {/* Skeleton for Search Button */}
      <div className="w-full md:w-full lg:max-w-56 flex justify-center">
        <Skeleton className="animate-shimmer" width={200} height={50} />
      </div>
    </div>
  );
});
FiltersSkeleton.displayName = 'FiltersSkeleton';
export default FiltersSkeleton;
