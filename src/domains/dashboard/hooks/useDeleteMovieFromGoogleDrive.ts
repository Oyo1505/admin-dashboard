import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovieByIdToGoogleDrive } from '../actions/movie';

const useDeleteMovieFromGoogleDrive = () => {
  const queryClient = useQueryClient();

  const deleteMovieFromGoogleDrive = useMutation({
    mutationFn: (movieId: string) => deleteMovieByIdToGoogleDrive(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies-from-google-drive'] });
    },
    onError: (error) => {
      console.error('Error deleting movie from Google Drive:', error);
    },
  });

  return { deleteMovieFromGoogleDrive };
};

export default useDeleteMovieFromGoogleDrive;
