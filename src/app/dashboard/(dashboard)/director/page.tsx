import { getDirectorFromSection } from "@/domains/dashboard/action";
import DirectorSectionForm from "@/domains/dashboard/components/director-section-form/director-section-form";
import { auth } from "@/lib/auth";
import { getUserConnected } from "@/domains/auth/action/action";
import checkPermissions from "@/shared/utils/permissions/checkPermissons";
export const revalidate = 60;

export default async function Page() {
  const session = await auth()
  const userConnected = await getUserConnected(session?.user?.email ?? '')
  const hasPermission =  userConnected?.user && checkPermissions(userConnected?.user, "can:update", "director") && checkPermissions(userConnected?.user, "can:create", "director") && checkPermissions(userConnected?.user, "can:delete", "director")
  if(!hasPermission) return <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>Vous n&lsquo;avez pas les permissions pour accéder à cette page</div>
  const { directorMovies } = await getDirectorFromSection()
  return (
    <main className="h-full" role="main" aria-label="Page des réalisateurs">
      <div className='flex flex-1 flex-col gap-4 md:gap-8 md:p-6' role="region" aria-label="Formulaire du réalisateur">
        <DirectorSectionForm director={directorMovies} aria-label="Formulaire de modification du réalisateur"/>
      </div>
    </main>
  );
}