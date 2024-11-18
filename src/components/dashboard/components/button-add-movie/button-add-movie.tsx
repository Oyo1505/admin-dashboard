'use client';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { Input } from '@/components/ui/components/input/input'
import LabelForm from '@/components/ui/components/label-form/label-form';
import React, { useEffect, useState } from 'react'
import { useMovieGoogleDiveStore } from 'store/movie/movie-store';

const ButtonAddMovie = () => {

  const { uploadGoogleDive, isLoading } = useMovieGoogleDiveStore();
  const [canBeUploaded, setCanBeUploaded] = React.useState(false);
  const [fileName , setFileName] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files && event.target.files.length > 0){
    const fileUploaded = event.target.files[0];

    if(fileUploaded.size > 0 && fileUploaded.type === 'video/mp4'){
        setCanBeUploaded(true);
        setFileName(fileUploaded.name);
      }
    }
  };

  useEffect(() => {
    if(isLoading && fileName){
      setFileName('');
    }
    if(!isLoading && !fileName){
      setCanBeUploaded(false);
    }
  }, [isLoading, fileName]);

  return (
    <div>
      {isLoading ? <LoadingSpinner /> :  
      <form action={uploadGoogleDive}>
        {!canBeUploaded && <LabelForm htmlFor="file" role='button' className='border-white border-2 p-4 rounded-md' titleLabel="Upload movie" /> }
        <Input type='file' className='hidden' id="file" name='file'  onChange={handleChange} />
        {canBeUploaded && 
        <>
          <div>{fileName}</div>
          <Input className='w-32 mt-2 hover:cursor-pointer' type='submit'/>
        </>
        }
      </form>
      }

    </div>
  )
}

export default ButtonAddMovie