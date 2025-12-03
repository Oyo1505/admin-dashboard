import DirectorSectionForm from '@/domains/dashboard/components/director-section-form/director-section-form';
import Text from '@/domains/ui/components/text/text';
import { getServerSession } from '@/lib/auth';
import { DirectorData } from '@/lib/data/director';
import { UserData } from '@/lib/data/users';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { IUser } from '@/types';

async function getData() {
  const { director } = await DirectorData.getDirectorFromSection();
  return { director };
}

export default async function Page() {
  const session = await getServerSession();
  const userConnected = await UserData.getUserConnected(
    session?.user?.email ?? ''
  );
  const { director } = await getData();
  const user = userConnected?.user as IUser;
  const hasPermission =
    user &&
    checkPermissions(user, 'can:update', 'director') &&
    checkPermissions(user, 'can:create', 'director') &&
    checkPermissions(user, 'can:delete', 'director');
  if (!hasPermission)
    return (
      <Text
        translationTheme="ErrorMessage"
        translationText="notPermitted"
        className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6"
      />
    );

  return (
    <main className="h-full" role="main" aria-label="Page des réalisateurs">
      <div
        className="flex flex-1 flex-col gap-4 md:gap-8 md:p-6"
        role="region"
        aria-label="Formulaire du réalisateur"
      >
        <DirectorSectionForm
          director={director}
          aria-label="Formulaire de modification du réalisateur"
        />
      </div>
    </main>
  );
}
