'use client';
import { Button } from '@/domains/ui/components/button/button';
import { TableCell, TableRow } from '@/domains/ui/components/table/table';
import Toggle from '@/domains/ui/components/toggle/toggle';
import { deleteFileFromGoogleDrive } from '@/googleDrive';
import { IMovie } from '@/models/movie/movie';
import {
  URL_DASHBOARD_MOVIE_ADD,
  URL_DASHBOARD_MOVIE_EDIT,
} from '@/shared/route';
import { checkPermissions } from '@/shared/utils/permissions/checkPermissons';
import useUserStore from '@/store/user/user-store';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteMovieById, publishedMovieById } from '../../actions/movie';

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

  const { data, isFetching, status, refetch } = useQuery({
    queryKey: ['moviePublish', movie?.id],
    enabled: false,
    queryFn: () => publishedMovieById(movie?.id),
  });

  useEffect(() => {
    if (data && status === 'success' && data?.publish) {
      setIsMoviePublished(data?.publish);
    }
  }, [data, status]);

  const onDeleteMovieOnGoogleDrive = async (): Promise<void> => {
    if (movie?.id) {
      await deleteFileFromGoogleDrive(movie?.id);
    }
  };

  const hasPermissionToDelete = checkPermissions(user, 'can:delete', 'movie');
  const hasPermissionToUpdate = checkPermissions(user, 'can:update', 'movie');

  return (
    movie &&
    movie.id && (
      <>
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
                {isMoviePublished !== undefined ? (
                  <Link
                    href={URL_DASHBOARD_MOVIE_EDIT(movie?.id)}
                    className="font-bold bg-background p-3 rounded-md text-primary"
                  >
                    {btnText}
                  </Link>
                ) : (
                  <Link
                    href={URL_DASHBOARD_MOVIE_ADD(movie?.id)}
                    className="font-bold bg-background p-3 rounded-md text-primary"
                  >
                    {btnText}
                  </Link>
                )}
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
            {isMoviePublished === undefined && hasPermissionToDelete && (
              <Button
                variant={'destructive'}
                className="font-bold"
                formAction={onDeleteMovieOnGoogleDrive}
              >
                Supprimer sur Google
              </Button>
            )}
          </TableCell>
        </TableRow>
      </>
    )
  );
}

export default MovieRow;
