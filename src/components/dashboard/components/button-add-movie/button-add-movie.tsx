'use client';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { Button } from '@/components/ui/components/button/button';
import { Input } from '@/components/ui/components/input/input'
import { addFileToGoogleDriveAction } from '@/googleDrive';
import {  movieUploadSchema } from '@/shared/schema/movieSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query'

const ButtonAddMovie = ({handleSubmitGoogleDrive}: { handleSubmitGoogleDrive: (formData: FormData) => Promise<void> }) => {

  const [canBeUploaded, setCanBeUploaded] = React.useState(false);
  const [fileName , setFileName] = useState('');
  const [file , setFile] = useState<File>();
  
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files && event.target.files.length > 0){
    const fileUploaded = event.target.files[0];
    if(fileUploaded.size > 0 && fileUploaded.type === 'video/mp4'){
        setCanBeUploaded(true);
        setFileName(fileUploaded.name);
        setFile(fileUploaded)
      }
    }
  };
  const { mutate, isSuccess, isPending } =  useMutation({
    mutationFn: (data:any) => addFileToGoogleDriveAction(data.file),
  });
  
  // useEffect(() => {
  //   if( fileName){
  //  //   setFileName('');
  //   }
  //   if( !fileName){
  //     setCanBeUploaded(false);
  //   }
  // }, [isPending, fileName]);
  
  const { handleSubmit, register, control, formState: { errors } } = useForm({
   resolver: zodResolver(movieUploadSchema)
  },
);
const  onSubmit = async (data : any) => {
  try {
    mutate(data)
  } catch (error) {
    console.log(error)
  } 
}
  return (
    <div>
      {isPending ? <LoadingSpinner /> :  
     <form onSubmit={handleSubmit(onSubmit)}>
     <Controller
       name="file"
       control={control}
       render={({  field: { onChange }  }) => (
         <Input
           type="file"
           accept=".mp4"
           onChange={(e)=>e.target.files && onChange(e.target.files[0]) }
         />
       )}
     />

     {canBeUploaded && 
      <>
        <div>{fileName}</div>

      </>
      
     }

<Button  type='submit' variant='outline' >Submit</Button>
   </form>
      }
    </div>
  )
}

export default ButtonAddMovie