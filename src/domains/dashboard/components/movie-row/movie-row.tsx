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
import { useEffect, useState } from 'react';
import { deleteMovieById } from '../../actions/movie';
import { useMovieData } from '../../hooks/useMovieData';

function MovieRow({
  movie,
  btnText,
  index,
}: {
  movie: IMovie;
  btnText: string;
  index?: number;
}) {
  const [isMoviePublished, setIsMoviePublished] = useState<boolean>(
    movie.publish
  );

  const { user } = useUserStore();
  const onClickDeleteMovie = async (): Promise<void> => {
    if (movie?.id) {
      await deleteMovieById(movie?.id);
    }
  };

  const { getMoviePublish } = useMovieData({ editMovie: false, movie });
  const { data, isFetching, refetch, status } = getMoviePublish;
  useEffect(() => {
    if (status === 'success' && data?.publish !== undefined) {
      setIsMoviePublished(data.publish);
    }
  }, [data, status]);

  const hasPermissionToDelete = checkPermissions(user, 'can:delete', 'movie');
  const hasPermissionToUpdate = checkPermissions(user, 'can:update', 'movie');

  return (
    movie &&
    movie.id && (
      <TableRow className="border-b border-background border-opacity-20">
        <TableCell className="font-bold">
          {index}. {movie.title ?? movie.id}
        </TableCell>
        {movie.title && (
          <TableCell>
            <Toggle
              toggle={() => refetch()}
              publish={isMoviePublished}
              isFetching={isFetching}
            />
          </TableCell>
        )}
        <TableCell>
          {hasPermissionToUpdate && (
            <>
              <Link
                href={
                  isMoviePublished !== undefined
                    ? URL_DASHBOARD_MOVIE_EDIT(movie.id)
                    : URL_DASHBOARD_MOVIE_ADD(movie.id)
                }
                className="font-bold bg-background p-3 rounded-md text-primary"
              >
                {btnText}
              </Link>
            </>
          )}
        </TableCell>
        <TableCell>
          {hasPermissionToDelete && (
            <Button
              variant="destructive"
              className="font-bold"
              formAction={onClickDeleteMovie}
            >
              Supprimer
            </Button>
          )}
        </TableCell>
      </TableRow>
    )
  );
}

export default MovieRow;
