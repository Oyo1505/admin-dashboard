'use client'
import { TableCell, TableRow } from '@/domains/ui/components/table/table'
import React, { useEffect, useState } from 'react'
import { IMovie } from '@/models/movie/movie'
import { Button } from '@/domains/ui/components/button/button'
import { deleteMovieById, publishedMovieById } from '../../action'
import Toggle from '@/domains/ui/components/toggle/toggle'
import { useQuery } from '@tanstack/react-query'
import { deleteFileFromGoogleDrive } from '@/googleDrive'
import Link from 'next/link'
import { URL_DASHBOARD_MOVIE_ADD, URL_DASHBOARD_MOVIE_EDIT } from '@/shared/route'
import useUserStore from 'store/user/user-store'

function MovieRow({ movie, btnText, index}: { movie:IMovie , btnText: string, index?: number}) {
  const [isMoviePublished, setIsMoviePublished] = useState<boolean>(movie.publish);
  const { user } = useUserStore();
  const onClickDeleteMovie = async (): Promise<void> => {
    movie?.id && (await deleteMovieById(movie?.id, user))
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
      <TableRow className='border-b border-background border-opacity-20'>
        <TableCell className="font-bold">{index}. {movie.title ?? movie.id}</TableCell>
          {movie.title &&   
          <TableCell> 
             <Toggle toggle={refetch} publish={isMoviePublished} isFetching={isFetching} />
          </TableCell>}
          <TableCell>
            {isMoviePublished !== undefined ? 
            <Link href={URL_DASHBOARD_MOVIE_EDIT(movie?.id)} className='font-bold bg-background p-3 rounded-md text-primary' >
              {btnText}
            </Link> : 
            <Link href={URL_DASHBOARD_MOVIE_ADD(movie?.id)} className='font-bold bg-background p-3 rounded-md text-primary' >
              {btnText}
            </Link>}
          </TableCell>
          <TableCell> 
            <Button variant={'destructive'} className='font-bold' formAction={onClickDeleteMovie} >
               Supprimer
            </Button>
           {isMoviePublished === undefined && 
           <Button variant={'destructive'} className='font-bold' formAction={onDeleteMovieOnGoogleDrive} >
              Supprimer sur Google
           </Button>
           } 
          </TableCell>
        </TableRow>
      </>
  );
}

export default MovieRow