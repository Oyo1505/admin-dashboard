import { getDirectorFromSection } from "@/components/dashboard/action";
import DirectorSectionForm from "@/components/dashboard/components/director-section-form/director-section-form";

export default async function Page() {
  const { directorMovies } = await getDirectorFromSection()

  return (
    <main className="h-full">
      <div  className='flex flex-1 flex-col gap-4  md:gap-8 md:p-6'>
         <DirectorSectionForm director={directorMovies}/>
      </div>
    </main>
  );
}