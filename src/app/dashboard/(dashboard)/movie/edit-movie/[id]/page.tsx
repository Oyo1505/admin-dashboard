
import FormMovie from '@/domains/dashboard/components/form-movie/form-movie';
import { getMovieDetail } from '@/domains/movies/action';
import { IMovie } from '@/models/movie/movie';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const getData = async (id: string) => {
  try {
    const { movie } = await getMovieDetail(id) as { movie: IMovie };
    if (!movie) {
      notFound();
    }
    return { movie };
  } catch (err) {
    console.error('Erreur lors de la récupération du film:', err);
    notFound();
  }
};

const Page = async (props: PageProps) => {
  const { id } = await props.params;
  const { movie } = await getData(id) as { movie: IMovie };
  
  return (
    <FormMovie movie={movie} editMovie={true} />
  );
};

export default Page;
