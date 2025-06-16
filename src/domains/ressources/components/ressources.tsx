import Image from "next/image";
const Ressources = ({ listeRessources }: { listeRessources: any[] }) => {

  return <div className="flex flex-wrap gap-4 h-screen">
    {listeRessources && listeRessources.length > 0 ? listeRessources?.map((ressource) => (
   <a href={ressource.url} target="_blank" rel="noopener noreferrer" className={`group relative flex  w-28 md:w-44 lg:w-64 rounded-lg  flex-col justify-between`}>
   <div className='w-full rounded-lg h-full relative overflow-hidden'>
     <div className='relative w-full h-full'>
        {ressource?.image && <Image
         priority
         src={ressource.image}
         alt={ressource.name}
         className='w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110'
         width={300}
         height={200}
       />}
     </div>
     <div className='absolute inset-0 rounded-lg group-hover:bg-background k group-hover:opacity-50'></div>
   </div>
 <div className='absolute pr-2 pl-2 inset-0 flex text-center items-center  justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity'>{ressource.name}</div>
</a>
  )) : <div>Aucune ressource trouvée</div>}
  </div>;
};

export default Ressources;
