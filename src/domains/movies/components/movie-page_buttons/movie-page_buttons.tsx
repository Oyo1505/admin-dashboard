'use client';
import { Button } from '@/domains/ui/components/button/button';
import {
  DownloadLogo,
  EditMovieLogo,
  Favorite,
} from '@/domains/ui/components/icons/icons';
import { URL_DASHBOARD_MOVIE_EDIT } from '@/shared/route';
import { IMovie } from '@/models/movie/movie';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import checkPermissions from '@/shared/utils/permissions/checkPermissons';
import useUserStore from 'store/user/user-store';
import { useTransition } from 'react';
import { addOrRemoveToFavorite } from '../../action';
import { toast } from 'react-toastify';

const MoviePageButtons = ({
  isFavorite,
  movie,
}: {
  isFavorite: boolean;
  movie: IMovie;
}) => {
  const user = useUserStore((state) => state.user);
  const [loading, startTransiton] = useTransition();
  const hasPermission = checkPermissions(user, 'can:update', 'movie');
  const t = useTranslations('MoviePage');

  const handleFavorite = async () => {
    if (user?.id) {
      startTransiton(async () => {
        try {
          const res =
            user?.id && (await addOrRemoveToFavorite(user?.id, movie?.id));
          if (res && typeof res !== 'string' && res.status === 200) {
            if (res?.message === 'Ajouté aux favoris avec succès') {
              toast.success(t('toastMessageSuccess'), {
                position: 'top-center',
              });
            } else if (res?.message === 'Supprimé des favoris avec succès') {
              toast.success(t('toastMessageSuccessDelete'), {
                position: 'top-center',
              });
            }
          }
        } catch (err) {
          console.log(err);
          toast.error(t('toastMessageError'), { position: 'top-center' });
        }
      });
    }
  };
  return (
    <div className="flex md:flex-row flex-col gap-4 mt-6 w-full md:items-center justify-start">
      <form>
        <Button
          disabled={loading}
          className="flex justify-start cursor-pointer items-center gap-2 w-full md:w-auto"
          formAction={handleFavorite}
        >
          {isFavorite ? (
            <>
              <Favorite fill={true} />
              {t('removeFromFavorite')}
            </>
          ) : (
            <>
              <Favorite />
              {t('addToFavorite')}
            </>
          )}
        </Button>
      </form>

      <a
        href={`https://drive.usercontent.google.com/download?id=${movie?.idGoogleDive}&export=download`}
        className="inline-flex gap-2 rounded-md p-3 h-10 min-w-16 px-4 py-2 bg-primary text-background  font-bold hover:bg-primary hover:text-green-700"
        target="_blank"
        download
      >
        {<DownloadLogo />}
        {t('download')}
      </a>
      {hasPermission && movie?.id && (
        <>
          <Link
            className="inline-flex gap-2 rounded-md  p-3 h-10 min-w-16 px-4 py-2 bg-primary text-background  font-bold hover:bg-primary"
            href={URL_DASHBOARD_MOVIE_EDIT(movie?.id)}
            prefetch
          >
            <EditMovieLogo /> {t('editMovie')}
          </Link>
        </>
      )}
    </div>
  );
};

export default MoviePageButtons;
