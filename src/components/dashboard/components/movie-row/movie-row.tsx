'use client'
import { TableCell, TableRow } from '@/components/ui/components/table/table'
import React from 'react'
import { IMovie } from '@/models/movie/movie'
import DialogAddMovie from '@/components/ui/components/modal-add-movie/modal-add-movie'
import * as Dialog  from '@radix-ui/react-dialog'
import { deleteMovieById, deleteUserById } from '../../action'

function MovieRow({ movie, createMovie, btnText }: { movie:IMovie, createMovie: Function, btnText: string}) {
  const onClickDeleteMovie = async (e) => {
    e.preventDefault()
    movie?.id && await deleteMovieById(movie?.id)
  }
  return (
     <>
     <Dialog.Root>
      <TableRow>
        <TableCell className="font-medium">{movie.title ?? movie.id}</TableCell>
          <TableCell>
            <Dialog.Trigger asChild>
              <button  className="text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
                {btnText}
              </button>
            </Dialog.Trigger>
          </TableCell>
          <TableCell>
        
              <button onClick={onClickDeleteMovie}  className="text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
                Supprimer
              </button>
           
          </TableCell>
        </TableRow>
        <DialogAddMovie  movie={movie} createMovie={createMovie}/>
      </Dialog.Root>
      </>
  );
}

export default MovieRow