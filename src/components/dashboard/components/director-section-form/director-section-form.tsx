"use client"
import { Button } from "@/components/ui/components/button/button";
import { Input } from "@/components/ui/components/input/input";
import { DirectorSectionSchema, directorSectionSchema } from "@/shared/schema/movieSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDirectorFromSection, updateDirectorFromSection } from "../../action";
import { useTranslations } from "next-intl";
import { IDirector } from "@/models/director/director";

const DirectorSectionForm = ({director}:{director?:IDirector}) => {

  const t = useTranslations('DirectorSectionForm');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id : director?.id,
      director: director?.director ?? '',
      imageBackdrop : director?.imageBackdrop ?? '',
    },
    resolver: zodResolver(directorSectionSchema)
  });

  const  createDirectorSection = async (data : DirectorSectionSchema) => {
    console.log(data)
    try {
      const director = await createDirectorFromSection(data)
      console.log(director)
    } catch (error) {
      console.log(error)
    }
  
    
  }

  const  uploadDirectorSection = async (data : DirectorSectionSchema) => {
    try {
      const director = await updateDirectorFromSection(data)
      console.log(director)
    } catch (error) {
      console.log(error)
    }
  }

  const deleteDirectorSection = async (id:string) => {
    try {
      //const director = await deleteDirectorFromSection(id)
      console.log(director)
    } catch (error) {
      console.log(error)
    }
  } 
  return (
    <div>
      <form onSubmit={handleSubmit(createDirectorSection)}>
      <fieldset className="mb-[15px]  flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="director">
          {t('director')}
          </label>
          <Input
           type="text"
           id="director"
           className="text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
           {...register('director')}
          />
          {errors.director && <p className="text-red-600 text-xs">{errors?.director?.message}</p>}
      </fieldset>
      <fieldset className="mb-[15px]  flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="imageBackdrop">
          {t('image')}
          </label>
          <Input
          type="text"
          id="imageBackdrop"
           className="text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
           {...register('imageBackdrop')}
          />
      </fieldset>
        <div className="mt-[25px] gap-2 flex justify-end">
         {!director?.id &&
         <Button 
           size="sm"
           variant='secondary'
           type='submit'
           className="bg-red-500 hover:bg-red-600 text-white inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
         >
            {t('delete')}
         </Button> }
         <Button 
           size="sm"
           variant="outline"
           type='submit'
           className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
         >
            {t('save')}
         </Button>  
        </div>
        </form>
    </div>
  )
}

export default DirectorSectionForm