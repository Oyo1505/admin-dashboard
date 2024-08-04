'use client'
import { Button } from '@/components/ui/components/button/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/components/table/table'
import React from 'react'
import { addMovieToDb } from '../../action'
import { IMovie } from '@/models/movie/movie'
// import {
//   useQuery,
// } from '@tanstack/react-query'
// import { useSession } from 'next-auth/react'

const MovieTable = ({movies}: {movies: IMovie[]}) => {
  // const { data: session } = useSession();

  // const { isPending, error, data } = useQuery({
  //   queryKey: ['test'],
  //   queryFn: () =>fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='video/mp4' and '1r-YRsOe6x5Sx7hc8VKk5WzkcD5TI5YJD' in parents`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${session?.accessToken}`,
  //       },
  //     }).then(res =>  console.log(res.json()))
  // });
 
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>
        <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">Film</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies?.map((movie) => (
              <MovieRow key={movie?.id} movie={movie} />
            ))}
          </TableBody>
        </Table>
      </form>
    </div>
  )
}

async function MovieRow({ movie }: { movie:IMovie}) {

  const addMovie = async () => {
    movie && await addMovieToDb(movie)
  }  
  
  return (
     <>
            
    <TableRow>
      <TableCell className="font-medium">{movie.title}</TableCell>
            <TableCell>
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              formAction={addMovie}
            >
              Ajouter
            </Button>
          </TableCell>
      </TableRow>

      </>
  );
}
export default MovieTable