'use client';
import { Button } from '@/domains/ui/components/button/button';
import { TableCell, TableRow } from '@/domains/ui/components/table/table';
import Toggle from '@/domains/ui/components/toggle/toggle';
import { IMovie } from '@/models/movie/movie';
import {
  URL_DASHBOARD_MOVIE_ADD,
  URL_DASHBOARD_MOVIE_EDIT,
} from '@/shared/route';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import Link from 'next/link';
import { Activity } from 'react';
import { deleteMovieById } from '../../actions/movie';
import { useMovieData } from '../../hooks/useMovieData';

function MovieRow({
  movie,
  btnText,
  moviesFromGoogleDrive,
}: {
  movie: IMovie;
  btnText: string;
  moviesFromGoogleDrive?: boolean;
}) {
  const { user } = useUserStore();
  const onClickDeleteMovie = async (): Promise<void> => {
    if (movie?.id) {
      await deleteMovieById(movie?.id);
    }
  };

  const { getMoviePublish } = useMovieData({ editMovie: false, movie });
  const { data, isFetching, refetch, status } = getMoviePublish;

  const hasPermissionToDelete = checkPermissions(user, 'can:delete', 'movie');
  const hasPermissionToUpdate = checkPermissions(user, 'can:update', 'movie');
  const isMoviePublished = data?.publish ?? movie.publish;
  return (
    movie &&
    movie.id && (
      <TableRow className="border-b border-background border-opacity-20">
        <TableCell className="font-bold">{movie.title ?? movie.id}</TableCell>
        {movie.title && (
          <TableCell className="text-center w-32">
            <Toggle
              toggle={() => refetch()}
              publish={isMoviePublished}
              isFetching={isFetching}
            />
          </TableCell>
        )}
        <TableCell>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            {hasPermissionToUpdate && (
              <Link
                href={
                  isMoviePublished !== undefined
                    ? URL_DASHBOARD_MOVIE_EDIT(movie.id)
                    : URL_DASHBOARD_MOVIE_ADD(movie.id)
                }
                className="font-bold bg-background px-3 py-2 rounded-md text-primary"
              >
                {btnText}
              </Link>
            )}
            <Activity
              mode={
                hasPermissionToDelete && !moviesFromGoogleDrive
                  ? 'visible'
                  : 'hidden'
              }
            >
              <Button
                aria-label="delete-movie-button"
                variant="destructive"
                className="font-bold hover:cursor-pointer"
                formAction={onClickDeleteMovie}
              >
                Supprimer
              </Button>
            </Activity>
          </div>
        </TableCell>
      </TableRow>
    )
  );
}

export default MovieRow;
