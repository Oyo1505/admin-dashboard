'use client'
import { TableCell, TableRow } from '@/components/ui/components/table/table'
import React, { useEffect, useState } from 'react'
import { IMovie } from '@/models/movie/movie'
import DialogAddMovie from '@/components/ui/components/modal-add-movie/modal-add-movie'
import * as Dialog  from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/components/button/button'
import { deleteMovieById, publishedMovieById } from '../../action'
import Toggle from '@/components/ui/components/toggle/toggle'
import { useQuery } from '@tanstack/react-query'
import { deleteFileFromGoogleDrive } from '@/googleDrive'

function MovieRow({ movie, btnText, editMovie, index}: { movie:IMovie , btnText: string, editMovie?: boolean, index?: number}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMoviePublished, setIsMoviePublished] = useState<boolean>(movie.publish);

  const onClickDeleteMovie = async (): Promise<void> => {
    movie?.id && (await deleteMovieById(movie?.id))
  }

  const { data, isFetching, status, refetch } = useQuery({
    queryKey: ['moviePublish', movie?.id],
    enabled: false,
    queryFn: () => publishedMovieById(movie?.id),
  });

  useEffect(() => { 
    if(data && status === "success"){
      setIsMoviePublished(data.publish)
    }
  },[data, status]);
  const onDeleteMovieOnGoogleDrive = async (): Promise<void> => {
    movie?.id && (await deleteFileFromGoogleDrive(movie?.id))
  }

  return (
    movie && movie.id &&
     <>
     <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className='border-b border-background border-opacity-20'>
        <TableCell className="font-bold">{index}. {movie.title ?? movie.id}</TableCell>
          {movie.title &&   
          <TableCell> 
             <Toggle toggle={refetch} publish={isMoviePublished} isFetching={isFetching} />
          </TableCell>}
          <TableCell>
            <Dialog.Trigger asChild>
            <Button  onClick={() => setIsOpen(true)}  variant={'outline'} className='font-bold  text-primary' >
              {btnText}
            </Button>
            </Dialog.Trigger>
          </TableCell>
          <TableCell> 
            <Button variant={'destructive'} className='font-bold' formAction={onClickDeleteMovie} >
               Supprimer
            </Button>
            <Button variant={'destructive'} className='font-bold' formAction={onDeleteMovieOnGoogleDrive} >
               Supprimer sur Google
            </Button>
          </TableCell>
        </TableRow>
       {isOpen &&  <DialogAddMovie  movie={movie} editMovie={editMovie}  setIsOpen={setIsOpen} />}
      </Dialog.Root>
      </>
  );
}

export default MovieRow