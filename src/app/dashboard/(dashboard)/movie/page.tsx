import MovieTable from '@/domains/dashboard/components/movie-table/movie-table';
import Text from '@/domains/ui/components/text/text';
import { getDataFromGoogleDrive } from '@/googleDrive';
import { getServerSession } from '@/lib/auth';
import { MovieData } from '@/lib/data/movies';
import { UserData } from '@/lib/data/users';

import { IMovie } from '@/models/movie/movie';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { User } from 'better-auth/types/user';
import { Suspense } from 'react';

export const revalidate = 60;

const Page = async () => {
  const { movies } = (await getDataFromGoogleDrive()) as { movies: IMovie[] };
  const { movieInDb } = await MovieData.getAllMoviesWithGenres();
  const session = await getServerSession();
  const userConnected = await UserData.getUserConnected(
    session?.user?.email ?? ''
  );
  const user = userConnected?.user as User;
  const hasPermission =
    user &&
    checkPermissions(user, 'can:update', 'movie') &&
    checkPermissions(user, 'can:create', 'movie') &&
    checkPermissions(user, 'can:delete', 'movie');
  if (!hasPermission)
    return (
      <Text
        translationTheme="ErrorMessage"
        translationText="notPermitted"
        className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6"
      />
    );
  return (
    <Suspense fallback={null}>
      <MovieTable movies={movies} movieInDb={movieInDb as IMovie[]} />
    </Suspense>
  );
};

export default Page;
