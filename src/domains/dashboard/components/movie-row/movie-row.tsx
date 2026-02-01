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
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Activity } from 'react';
import useDeleteMovieFromGoogleDrive from '../../hooks/useDeleteMovieFromGoogleDrive';
import useDeleteMovieFromPrisma from '../../hooks/useDeleteMovieFromPrisma';
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
  const { deleteMovieFromGoogleDrive } = useDeleteMovieFromGoogleDrive();
  const { deleteMovieFromPrisma } = useDeleteMovieFromPrisma();
  const t = useTranslations('Dashboard');
  const onClickDeleteMovie = async (): Promise<void> => {
    if (movie?.id) {
      await deleteMovieFromPrisma.mutateAsync(movie?.id);
    }
  };

  const onClickDeleteMovieToGoogleDrive = async (): Promise<void> => {
    if (movie?.id) {
      await deleteMovieFromGoogleDrive.mutateAsync(movie?.id);
    }
  };
  const { status: statusPrismaDelete } = deleteMovieFromPrisma;
  const { status: statusGoogleDriveDelete } = deleteMovieFromGoogleDrive;
  const { getMoviePublish } = useMovieData({ editMovie: false, movie });
  const { data, isFetching, refetch } = getMoviePublish;

  const hasPermissionToDelete = checkPermissions(user, 'can:delete', 'movie');
  const hasPermissionToUpdate = checkPermissions(user, 'can:update', 'movie');
  const isMoviePublished = data?.publish ?? movie.publish;
  console.log('movie-row render', movie.owners?.[0]?.emailAddress);
  return (
    <Activity mode={movie && movie.id ? 'visible' : 'hidden'}>
      <TableRow className="border-b border-background border-opacity-20">
        <TableCell className="font-bold">{movie.title ?? movie.id}</TableCell>
        <Activity mode={movie.title ? 'visible' : 'hidden'}>
          <TableCell className="text-center w-32">
            <Toggle
              toggle={() => refetch()}
              publish={isMoviePublished}
              isFetching={isFetching}
            />
          </TableCell>
        </Activity>

        <TableCell>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <Activity mode={hasPermissionToUpdate ? 'visible' : 'hidden'}>
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
            </Activity>
            <Activity
              mode={
                movie.owners?.[0]?.emailAddress ===
                process.env.NEXT_PUBLIC_CLIENT_EMAIL_GOOGLE_DRIVE
                  ? 'visible'
                  : 'hidden'
              }
            >
              <Button
                aria-label="delete-movie-button-from-google-drive"
                variant="destructive"
                className="font-bold hover:cursor-pointer"
                disabled={statusGoogleDriveDelete === 'pending'}
                formAction={onClickDeleteMovieToGoogleDrive}
              >
                {t('deleteButton')}
              </Button>
            </Activity>
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
                disabled={statusPrismaDelete === 'pending'}
                formAction={onClickDeleteMovie}
              >
                {t('deleteButton')}
              </Button>
            </Activity>
          </div>
        </TableCell>
      </TableRow>
    </Activity>
  );
}

export default MovieRow;
