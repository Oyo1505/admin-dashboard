'use client'
import { TableCell, TableRow } from '@/components/ui/components/table/table'
import React from 'react'
import { IMovie } from '@/models/movie/movie'
import DialogAddMovie from '@/components/ui/components/modal-add-movie/modal-add-movie'
import * as Dialog  from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/components/button/button'
import { deleteMovieById } from '../../action'

function MovieRow({ movie, btnText, editMovie}: { movie:IMovie, btnText: string, editMovie?: boolean}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const onClickDeleteMovie = async () => {
    movie?.id && await deleteMovieById(movie?.id)
  
  }

  return (
     <>
     <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <TableRow>
        <TableCell className="font-medium">{movie.title ?? movie.id}</TableCell>
          <TableCell>
              <Dialog.Trigger asChild>
            <Button onClick={() => setIsOpen(true)}  className="text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
              {btnText}
            </Button>
            </Dialog.Trigger>
          </TableCell>
          <TableCell>
             
              <Button formAction={onClickDeleteMovie}  className="text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
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