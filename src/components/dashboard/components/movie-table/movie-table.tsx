'use client'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/components/table/table'
import React from 'react'
import { IMovie, IMovieFileGoogleDrive } from '@/models/movie/movie'
import MovieRow from '../movie-row/movie-row'
import { useQuery } from '@tanstack/react-query'
import { getAllMovies } from '../../action'

const MovieTable = ({movies, createMovie}: {movies: IMovieFileGoogleDrive[], createMovie: Function}) => {
  const {data} = useQuery({
    queryKey: ['movies'],
    queryFn: async () => await getAllMovies()
  })

  const filteredMoviesNotAdded = movies.filter(testMovie => !data?.movieInDb?.some(dataMovie => dataMovie.idGoogleDive === testMovie.id));
  
  const filteredMoviesAdded = data?.movieInDb?.filter(testMovie => movies?.some(dataMovie => dataMovie.id === testMovie.idGoogleDive));
 
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>
        <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">Film non ajouté</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMoviesNotAdded ? filteredMoviesNotAdded?.map((movie) => (
              <MovieRow key={movie?.id} movie={movie} createMovie={createMovie}  btnText={'Ajouter'} />
            )): 'Aucun Film'}
          
          </TableBody>
        </Table>
      </form>
    {filteredMoviesAdded &&   filteredMoviesAdded?.length > 0 && <>      
      <form className="border shadow-sm rounded-lg mt-4">
      <Table >
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">Film Ajouté</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMoviesAdded ? filteredMoviesAdded?.map((movie) => (
              <MovieRow key={movie?.id} movie={movie} createMovie={() => console.log('createMovie')} btnText={'Editer'} />
            )): 'Aucun Film'}
          
          </TableBody>
        </Table>
      </form>
      </>}
    </div>
  )
}
export default MovieTable