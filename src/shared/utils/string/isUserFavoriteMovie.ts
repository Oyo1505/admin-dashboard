import { User } from '@/models/user/user';

const isFavorite = ({ id, user }: { id: string; user: User | undefined }) => {
  return user?.favoriteMovies?.some(
    (favoriteMovie) => favoriteMovie.movieId === id
  );
};

export default isFavorite;
