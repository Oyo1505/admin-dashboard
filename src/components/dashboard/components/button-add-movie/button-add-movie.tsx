'use client';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { Button } from '@/components/ui/components/button/button';
import { Input } from '@/components/ui/components/input/input'
import LabelForm from '@/components/ui/components/label-form/label-form';

import React, { useEffect, useState } from 'react'

const ButtonAddMovie = ({handleSubmitGoogleDrive}: { handleSubmitGoogleDrive: (formData: FormData) => Promise<void> }) => {

  const [canBeUploaded, setCanBeUploaded] = React.useState(false);
  const [fileName , setFileName] = useState('');
  const [file , setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if(isLoading && fileName){
   //   setFileName('');
    }
    if(!isLoading && !fileName){
      setCanBeUploaded(false);
    }
  }, [isLoading, fileName]);
  
  return (
    <div>
      {isLoading ? <LoadingSpinner /> :  
      <form action={handleSubmitGoogleDrive}>
        {!canBeUploaded && <LabelForm htmlFor="file" role='button' className='border-white border-2 p-4 rounded-md' titleLabel="Upload movie" /> }
        <Input type='file' className='hidden' id="file" name='file' onChange={handleChange} accept='.mp4' />
        {canBeUploaded && 
        <>
          <div>{fileName}</div>
          <Button  type='submit' variant='outline' >Submit</Button>
        </>
        }
      </form>
      }
    </div>
  )
}

export default ButtonAddMovie