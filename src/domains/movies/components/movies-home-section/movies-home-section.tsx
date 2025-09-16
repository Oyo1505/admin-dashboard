'use client';
import { IMovie } from '@/models/movie/movie';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const MovieItemCarousel = dynamic(
  () => import('../movie-item-carousel/movie-item-carousel'),
  {
    ssr: false,
  }
);

const MoviesHomeSection = memo(
  ({ movies, isMobileView }: { movies?: IMovie[]; isMobileView?: boolean }) => {
    const locale = useLocale();
    const responsive = useMemo(
      () => ({
        desktop: {
          breakpoint: { max: 5000, min: 1025 },
          items: 5,
          slidesToSlide: 1,
        },
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
      }),
      []
    );

    return movies && movies.length > 0 ? (
      <Carousel
        ssr={true}
        containerClass="h-48 md:h-72 lg:h-96 w-full mt-6 z-0"
        autoPlay={false}
        itemClass="flex justify-center"
        transitionDuration={500}
        draggable={isMobileView ? true : false}
        infinite={true}
        responsive={responsive}
      >
        {movies.map((movie, index) => (
          <MovieItemCarousel
            key={index}
            locale={locale}
            movie={movie}
            image={movie.image}
            id={movie.id}
          />
        ))}
      </Carousel>
    ) : null;
  }
);
MoviesHomeSection.displayName = 'MoviesHomeSection';
export default MoviesHomeSection;
