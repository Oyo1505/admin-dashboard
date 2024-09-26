"use client"
import { Button } from "@/components/ui/components/button/button";
import { Input } from "@/components/ui/components/input/input";
import { directorSectionSchema } from "@/shared/schema/movieSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const DirectorSectionForm = ({director}:{director?:any}) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      director:director?.director ?? '',
      image : director?.imageBackdrop ?? '',
    },
    resolver: zodResolver(directorSectionSchema)
  });
  const onSubmit = async (data: any) => {
    console.log(data)
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="mb-[15px]  flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="title">
          director
          </label>
          <Input
           className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
           {...register('director')}
          />
          {errors.director && <p className="text-red-600 text-xs">{errors.director.message}</p>}
      </fieldset>
      <fieldset className="mb-[15px]  flex flex-col items-center gap-2">
          <label className="text-violet11  text-right  text-[15px]" htmlFor="image">
          image
          </label>
          <Input
           className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
           {...register('image')}
          />
          {errors.image && <p className="text-red-600 text-xs">{errors.image.message}</p>}
      </fieldset>
        <div className="mt-[25px] flex justify-end">
         
         <Button 
           size="sm"
           variant="outline"
           type='submit'
           className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
         >
            save
         </Button> 
         
     </div>
        </form>
    </div>
  )
}

export default DirectorSectionForm