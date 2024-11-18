'use client';
import { Input } from '@/components/ui/components/input/input'
import LabelForm from '@/components/ui/components/label-form/label-form';
import { addFileToGoogleDrive } from '@/googleDrive'
import React from 'react'

const ButtonAddMovie = () => {
 
  const [canBeUploaded, setCanBeUploaded] = React.useState(false);
  const [fileName , setFileName] = React.useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files && event.target.files.length > 0){
    const fileUploaded = event.target.files[0];
    if(fileUploaded.size > 0 && fileUploaded.type === 'video/mp4'){
        setCanBeUploaded(true);
        setFileName(fileUploaded.name);
      }
    }
  };
  
  return (
    <div>
      <form action={addFileToGoogleDrive}>
        {!canBeUploaded && <LabelForm htmlFor="file" role='button' className='border-white border-2 p-4 rounded-md' titleLabel="Upload movie" /> }
        <Input type='file' className='hidden' id="file" name='file' onChange={handleChange} />
        {canBeUploaded && 
        <>
          <div>{fileName}</div>
          <Input className='w-32 mt-2 hover:cursor-pointer' type='submit'/>
        </>
    
        }
      </form>
    </div>
  )
}

export default ButtonAddMovie