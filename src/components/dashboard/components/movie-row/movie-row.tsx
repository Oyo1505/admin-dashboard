'use client'
import { TableCell, TableRow } from '@/components/ui/components/table/table'
import React from 'react'
import { IMovie } from '@/models/movie/movie'
import DialogAddMovie from '@/components/ui/components/modal-add-movie/modal-add-movie'
import * as Dialog  from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/components/button/button'
import { deleteMovieById } from '../../action'

function MovieRow({ movie, btnText, editMovie, index}: { movie:IMovie , btnText: string, editMovie?: boolean, index?: number}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const onClickDeleteMovie = async () => {
    movie?.id && await deleteMovieById(movie?.id)
  
  }

  return (
     <>
     <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className='border-b border-background border-opacity-20'>
        <TableCell className="font-bold">{index}. {movie.title ?? movie.id}</TableCell>
          <TableCell>
              <Dialog.Trigger asChild>
            <Button onClick={() => setIsOpen(true)}  variant={'outline'} className='font-bold  text-primary'  formAction={onClickDeleteMovie} >
              {btnText}
            </Button>
            </Dialog.Trigger>
          </TableCell>
          <TableCell> 
            <Button variant={'destructive'} className='font-bold' formAction={onClickDeleteMovie} >
               Supprimer
            </Button>
          </TableCell>
        </TableRow>
        <DialogAddMovie  movie={movie} editMovie={editMovie}  setIsOpen={setIsOpen} />
      </Dialog.Root>
      </>
  );
}

export default MovieRow