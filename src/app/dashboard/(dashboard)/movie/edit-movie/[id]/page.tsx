import FormMovie from '@/domains/dashboard/components/form-movie/form-movie';
import { getMovieDetail } from '@/domains/movies/actions/movie';
import { logError } from '@/lib/errors';

import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getData = async (id: string) => {
  try {
    const { movie } = await getMovieDetail(id);
    if (!movie) {
      notFound();
    }
    return { movie };
  } catch (err) {
    logError(err, 'getData');
    notFound();
  }
};

const Page = async (props: PageProps) => {
  const { id } = await props.params;
  const { movie } = await getData(id);

  return <FormMovie movie={movie} editMovie={true} />;
};

export default Page;
