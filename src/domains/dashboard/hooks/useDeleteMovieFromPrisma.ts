import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovieById } from '../actions/movie';

const useDeleteMovieFromPrisma = () => {
  const queryClient = useQueryClient();

  const deleteMovieFromPrisma = useMutation({
    mutationFn: (movieId: string) => deleteMovieById(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-movies-pagination'] });
    },
    onError: (error) => {
      console.error('Error deleting movie from Prisma:', error);
    },
  });
  console.log(deleteMovieFromPrisma);
  return { deleteMovieFromPrisma };
};

export default useDeleteMovieFromPrisma;
