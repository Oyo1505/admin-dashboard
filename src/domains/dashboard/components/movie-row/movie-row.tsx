'use client';
import ConfirmDialog from '@/domains/ui/components/confirm-dialog/confirm-dialog';
import { TableCell, TableRow } from '@/domains/ui/components/table/table';
import Toggle from '@/domains/ui/components/toggle/toggle';
import { useSession } from '@/lib/auth-client';
import { IMovie } from '@/models/movie/movie';
import {
  URL_DASHBOARD_MOVIE_ADD,
  URL_DASHBOARD_MOVIE_EDIT,
} from '@/shared/route';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
  const { data: session } = useSession();
  const user = { role: session?.user?.role as 'ADMIN' | 'USER' | undefined };
  const queryClient = useQueryClient();
  const { deleteMovieFromGoogleDrive } = useDeleteMovieFromGoogleDrive();
  const { deleteMovieFromPrisma } = useDeleteMovieFromPrisma();
  const t = useTranslations('Dashboard');
  const { getMoviePublish } = useMovieData({ editMovie: false, movie });
  const { data, isFetching, refetch } = getMoviePublish;

  if (!movie?.id) return null;

  const onClickDeleteMovie = async (): Promise<void> => {
    await deleteMovieFromPrisma.mutateAsync(movie.id);
  };

  const onClickDeleteMovieToGoogleDrive = async (): Promise<void> => {
    await deleteMovieFromGoogleDrive.mutateAsync(movie.id);
  };

  // The publish toggle changes which movies match the list filter
  const onTogglePublish = async () => {
    await refetch();
    await queryClient.invalidateQueries({
      queryKey: ['all-movies-pagination'],
    });
  };

  const hasPermissionToDelete = checkPermissions(user, 'can:delete', 'movie');
  const hasPermissionToUpdate = checkPermissions(user, 'can:update', 'movie');
  const isMoviePublished = data?.publish ?? movie.publish;
  const isOwnedByDriveAccount =
    movie.owners?.[0]?.emailAddress ===
    process.env.NEXT_PUBLIC_CLIENT_EMAIL_GOOGLE_DRIVE;
  const movieName = movie.title ?? movie.id;

  const deleteDialogProps = {
    triggerLabel: t('deleteButton'),
    // Visible text first so the accessible name contains it (WCAG 2.5.3)
    triggerAriaLabel: `${t('deleteButton')} ${movieName}`,
    title: t('confirmDeleteTitle', { title: movieName }),
    description: t('confirmDeleteDescription'),
    confirmLabel: t('deleteButton'),
    cancelLabel: t('cancel'),
  };

  return (
    <TableRow className="border-b border-background border-opacity-20">
      <TableCell className="font-bold">{movieName}</TableCell>
      {movie.title && (
        <TableCell className="text-center w-32">
          <Toggle
            toggle={onTogglePublish}
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
          {isOwnedByDriveAccount && (
            <ConfirmDialog
              {...deleteDialogProps}
              disabled={deleteMovieFromGoogleDrive.status === 'pending'}
              onConfirm={onClickDeleteMovieToGoogleDrive}
            />
          )}
          {hasPermissionToDelete && !moviesFromGoogleDrive && (
            <ConfirmDialog
              {...deleteDialogProps}
              disabled={deleteMovieFromPrisma.status === 'pending'}
              onConfirm={onClickDeleteMovie}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default MovieRow;
