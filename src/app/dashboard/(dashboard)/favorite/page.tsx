import { getFavoriteMovies } from '@/domains/dashboard/actions/movie';
import Title from '@/domains/ui/components/title/title';
import { getServerSession } from '@/lib/auth';
import { IMovie } from '@/models/movie/movie';
import dynamic from 'next/dynamic';
const MoviesFavorite = dynamic(
  () => import('@/domains/movies/components/movies-favorite/movies-favorite')
);

async function getData() {
  const session = await getServerSession();

  if (!session?.user?.id) return { movies: [] };

  const response = await getFavoriteMovies(session.user.id);
  return { movies: response.movies };
}

const Page = async () => {
  const { movies } = await getData();
  const moviesArray = movies?.map((movie: { movie: IMovie }) => movie?.movie);
  return (
    <div
      className="flex flex-1 flex-col gap-4 md:gap-8 md:p-6"
      role="main"
      aria-label="Page des favoris"
    >
      <div role="region" aria-label="Section des films favoris">
        <Title
          type="h1"
          translationTheme="DashboardNav"
          className="text-3xl"
          translationText="favorite"
        />
        <MoviesFavorite movies={moviesArray} />
      </div>
    </div>
  );
};

export default Page;
