'use client'
import { addGenre } from '@/components/movies/action'
import { Button } from '@/components/ui/components/button/button'
import { Input } from '@/components/ui/components/input/input'
import { genreSchema, GenreSectionSchema } from '@/shared/schema/movieSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'

const GenreForm = () => {

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nameFR: '',
      nameJP: '',
      nameEN: '',
    },
    resolver: zodResolver(genreSchema),
  });

  const onSubmit = async (data: GenreSectionSchema) => {
    try {
      await addGenre(data);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h3 className='text-xl mb-5'>Ajout d&apos;un genre</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className='flex flex-col gap-2'>
          <div>
            <label htmlFor='nameFr'>Francais</label>
            <Input className='text-black' type='text' {...register('nameFR')} />
          </div>
          <div>
            <label htmlFor='nameEN'>Anglais</label>
            <Input className='text-black' type='text' {...register('nameEN')} />
          </div>
          <div>
            <label htmlFor='nameJP'>Japonais</label>
            <Input className='text-black' type='text' {...register('nameJP')} />
          </div>
        </fieldset>

        <Button type='submit' className='mt-5' variant='outline' size='sm'>Ajouter</Button>
      </form>
    </div>
  )
}

export default GenreForm