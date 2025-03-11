import { getDirectorFromSection } from "@/domains/dashboard/action";
import DirectorSectionForm from "@/domains/dashboard/components/director-section-form/director-section-form";

export const revalidate = 60;

export default async function Page() {
  
  const { directorMovies } = await getDirectorFromSection()
  return (
    <main className="h-full" role="main" aria-label="Page des réalisateurs">
      <div className='flex flex-1 flex-col gap-4 md:gap-8 md:p-6' role="region" aria-label="Formulaire du réalisateur">
        <DirectorSectionForm director={directorMovies} aria-label="Formulaire de modification du réalisateur"/>
      </div>
    </main>
  );
}