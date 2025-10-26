import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SearchSkeleton = () => {
  return (
    <div className="relative mt-6 w-4/6 m-auto">
      {/* Skeleton for Search Icon */}
      <div className="absolute left-2.5 top-3 h-4 w-4">
        <Skeleton
          className="animate-shimmer"
          circle={true}
          height={16}
          width={16}
        />
      </div>

      {/* Skeleton for Input Field */}
      <Skeleton
        className="w-full animate-shimmer bg-white shadow-none text-background appearance-none pl-8"
        height={40}
        style={{ borderRadius: '4px' }}
      />
    </div>
  );
};
export default SearchSkeleton;
