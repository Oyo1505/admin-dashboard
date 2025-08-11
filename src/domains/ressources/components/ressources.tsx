"use client"
import { WebLogo } from "@/domains/ui/components/icons/icons";
import { Ressource } from "@/types";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Ressources = ({ listeRessources }: { listeRessources: Ressource[] }) => {
  const t = useTranslations("RessourcesPage");
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-screen">
    {listeRessources && listeRessources.length > 0 ? listeRessources?.map((ressource) => (
   <a href={ressource.url} key={ressource.id} target="_blank" rel="noopener noreferrer" className={`group relative flex  w-28 md:w-44 lg:w-64 rounded-lg  flex-col justify-between`}>
   <div className='w-full rounded-lg h-full relative overflow-hidden'>
     <div className='w-full h-full flex justify-center items-center'>
        {ressource?.image ?  <Image
         priority
         src={ressource.image}
         alt={ressource.name}
         className='w-full h-full object-contain rounded-lg'
         width={300}
         height={200}
       /> : <WebLogo className="size-12 md:size-30 lg:size-60"/>}
     </div>
     <div className='absolute inset-0 rounded-lg bg-background opacity-50'></div>
   </div>
 <div className='absolute pr-2 pl-2 inset-0 flex text-center items-center justify-center text-lg font-bold text-white'>{ressource.name}</div>
</a>
  )) : <div className="text-center text-lg font-bold">{t("noRessource")}</div>}
  </div>;
};

export default Ressources;
