import DirectorSectionForm from "@/components/dashboard/components/director-section-form/director-section-form";
import { zodResolver } from "@hookform/resolvers/zod";


export default async function Page() {

  return (
    <main className="h-full">
      <div  className='flex flex-1 flex-col gap-4  md:gap-8 md:p-6'>
        <h1>Director Section Form</h1>
        <DirectorSectionForm />
      </div>
    </main>
  );
}