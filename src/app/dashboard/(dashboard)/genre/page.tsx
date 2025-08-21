import { getUserConnected } from '@/domains/auth/action/action';
import GenreForm from '@/domains/dashboard/components/genre-form/genre-form';
import { GenreList } from '@/domains/dashboard/components/genre-list/genre-list';
import { getAllGenres } from '@/domains/movies/action';
import Container from '@/domains/ui/components/container/container';
import Title from '@/domains/ui/components/title/title';
import { auth } from '@/lib/auth';
import { User } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';

const getData = async () => {
  const { genres } = await getAllGenres();
  return { genres };
};

const Page = async () => {
  const { genres } = await getData();
  const session = await auth();
  const userConnected = await getUserConnected(session?.user?.email ?? '');
  const user = userConnected?.user as User;
  const hasPermission =
    user &&
    checkPermissions(user, 'can:update', 'genre') &&
    checkPermissions(user, 'can:create', 'genre') &&
    checkPermissions(user, 'can:delete', 'genre');
  if (!hasPermission)
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        Vous n&lsquo;avez pas les permissions pour accéder à cette page
      </div>
    );

  return (
    <Container className="flex flex-col gap-6 justify-start">
      <Title
        type="h1"
        translationTheme="GenrePage"
        translationText="title"
        className="text-2xl"
      />
      <GenreList genres={genres} />
      <GenreForm />
    </Container>
  );
};

export default Page;
