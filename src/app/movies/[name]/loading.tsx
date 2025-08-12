import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Loading = () => {
  return (
    <div className="h-auto pt-6 flex flex-col justify-start items-start">
      <div className="w-full flex flex-col lg:flex-row lg:gap-4">
        <div className="lg:grow-0 w-full">
          <Skeleton height={450} width="100%" className="animate-shimmer" />
        </div>

        <div className="w-full lg:w-1/2 mt-4 md:mt-0">
          <div className="mb-4">
            {/* Skeleton for the movie title */}
            <Skeleton height={30} width={300} className="animate-shimmer" />
            {/* Skeleton for original title */}
            <Skeleton
              height={20}
              width={200}
              className="animate-shimmer"
              style={{ marginTop: '10px' }}
            />
            {/* Skeleton for director */}
            <Skeleton
              height={20}
              width={150}
              className="animate-shimmer"
              style={{ marginTop: '10px' }}
            />
          </div>

          <div className="mb-4 flex flex-col gap-2">
            {/* Skeletons for movie year, genre, country, duration, and language */}
            <Skeleton height={20} width={100} />
            <Skeleton height={20} width={150} style={{ marginTop: '10px' }} />
            <Skeleton height={20} width={100} style={{ marginTop: '10px' }} />
            <Skeleton height={20} width={80} style={{ marginTop: '10px' }} />
            <Skeleton height={20} width={120} style={{ marginTop: '10px' }} />
          </div>

          {/* Skeleton for movie tags */}
          <Skeleton height={20} width={200} style={{ marginTop: '10px' }} />

          {/* Skeleton for subtitles */}
          <Skeleton height={20} width={180} style={{ marginTop: '10px' }} />

          {/* Skeleton for synopsis */}
          <Skeleton height={50} width="100%" style={{ marginTop: '20px' }} />

          <div className="mt-10 font-normal flex flex-col gap-3">
            {/* Skeleton for favorite button */}
            <Skeleton height={40} width={200} />

            {/* Skeleton for download button */}
            <Skeleton height={40} width={200} style={{ marginTop: '20px' }} />

            {/* Skeleton for subtitle sources */}
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton height={20} width={180} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-14 mb-10 flex gap-7 flex-col lg:flex-row">
        <div className="h-96 w-full lg:w-1/2">
          <Skeleton height={40} width={150} className="animate-shimmer" />
          <Skeleton height={300} width="100%" style={{ marginTop: '10px' }} />
        </div>

        <div className="h-full w-full lg:w-1/2">
          <Skeleton height={40} width={200} />
          <div className="flex gap-4 mt-4">
            <Skeleton height={250} width={150} />
            <Skeleton height={250} width={150} />
            <Skeleton height={250} width={150} />
            <Skeleton height={250} width={150} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
