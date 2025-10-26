import DirectorSectionForm from '@/domains/dashboard/components/director-section-form/director-section-form';
import Text from '@/domains/ui/components/text/text';
import { getServerSession } from '@/lib/auth';
import { getDirectorFromSection } from '@/lib/data/director';
import { getUserConnected } from '@/lib/data/users';
import { User } from '@/models/user/user';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';

export default async function Page() {
  const session = await getServerSession();
  const userConnected = await getUserConnected(session?.user?.email ?? '');
  const user = userConnected?.user as User;
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
  const { director } = await getDirectorFromSection();

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
