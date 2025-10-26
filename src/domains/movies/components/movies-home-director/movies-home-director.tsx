'use client';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import Container from '@/domains/ui/components/container/container';
import Title from '@/domains/ui/components/title/title';
import { IMovie } from '@/models/movie/movie';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import paramount from '../.../../../../../../public/images/paramount.webp';

const MovieItemCarousel = dynamic(
  () => import('../movie-item-carousel/movie-item-carousel'),
  {
    ssr: false,
  }
);

const MovieItemTheme = dynamic(
  () => import('../movie-item-theme/movie-item-theme'),
  {
    ssr: false,
  }
);

const MoviesHomeDirector = ({
  movies,
  director,
  isMobileView,
  fontFamily,
  imageBackdrop,
}: {
  movies?: IMovie[];
  director?: string;
  isMobileView?: boolean;
  fontFamily?: string;
  imageBackdrop?: string | null;
}) => {
  const locale = useLocale();

  const responsive = {
    tablet: {
      breakpoint: { max: 1024, min: 465 },
      items: 3,
      slidesToSlide: 1,
    },
    tabletHorizontal: {
      breakpoint: { max: 1400, min: 1025 },
      items: 3,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
      slidesToSlide: 1,
    },
  };

  const backgroundStyle = imageBackdrop
    ? {
        backgroundImage: `url(${imageBackdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `url(${paramount?.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div
        className={`w-full aspect-[0/0.4] md:aspect-[1/0.4] relative`}
        style={backgroundStyle}
      >
        <div className="absolute w-full h-full bg-slate-950 opacity-50  top-0 left-0 z-0"></div>
        <Container className="h-full pt-6 pb-6 flex relative flex-col justify-start items-start">
          <Title
            className={clsx(fontFamily, 'text-xl relative mb-4 md:text-xl')}
            text={'Zoom sur...'}
            type="div"
          />
          <Title
            className={clsx(fontFamily, 'text-2xl relative md:text-6xl')}
            text={director}
            type="h3"
          />

          <div className="h-full flex flex-wrap justify-start items-end gap-2">
            {movies &&
              movies?.length > 0 &&
              !isMobileView &&
              movies?.map((movie, index) => (
                <MovieItemTheme
                  key={index}
                  locale={locale}
                  movie={movie}
                  image={movie.image}
                  id={movie.id}
                />
              ))}
          </div>
          {movies && movies?.length > 0 && isMobileView && (
            <Carousel
              containerClass="w-full mt-6 "
              autoPlay={false}
              itemClass="flex justify-center"
              transitionDuration={500}
              draggable={true}
              infinite={true}
              responsive={responsive}
            >
              {movies?.map((movie, index) => (
                <MovieItemCarousel
                  key={index}
                  locale={locale}
                  movie={movie}
                  image={movie.image}
                  id={movie.id}
                />
              ))}
            </Carousel>
          )}
        </Container>
      </div>
    </Suspense>
  );
};

export default MoviesHomeDirector;
