import { memo } from 'react';

const MoviesHomeSectionSkeleton = memo(() => (
  <div className="w-full h-48 md:h-72 animate-shimmer lg:h-96 bg-gray-200 mt-6"></div>
));
MoviesHomeSectionSkeleton.displayName = 'MoviesHomeSectionSkeleton';
export default MoviesHomeSectionSkeleton;
