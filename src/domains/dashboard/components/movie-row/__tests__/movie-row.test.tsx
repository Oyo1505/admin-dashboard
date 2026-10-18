import { IMovie } from '@/models/movie/movie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import MovieRow from '../movie-row';

const mockDeleteFromPrisma = jest.fn();
const mockDeleteFromDrive = jest.fn();

jest.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: { user: { role: 'ADMIN' } } }),
}));

jest.mock('../../../hooks/useDeleteMovieFromPrisma', () => ({
  __esModule: true,
  default: () => ({
    deleteMovieFromPrisma: {
      mutateAsync: mockDeleteFromPrisma,
      status: 'idle',
    },
  }),
}));

jest.mock('../../../hooks/useDeleteMovieFromGoogleDrive', () => ({
  __esModule: true,
  default: () => ({
    deleteMovieFromGoogleDrive: {
      mutateAsync: mockDeleteFromDrive,
      status: 'idle',
    },
  }),
}));

jest.mock('../../../hooks/useMovieData', () => ({
  useMovieData: () => ({
    getMoviePublish: { data: undefined, isFetching: false, refetch: jest.fn() },
  }),
}));

const movie = { id: 'movie-1', title: 'Ran', publish: true } as IMovie;

const renderRow = (
  props: Partial<React.ComponentProps<typeof MovieRow>> = {}
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <table>
        <tbody>
          <MovieRow movie={movie} btnText="editButton" {...props} />
        </tbody>
      </table>
    </QueryClientProvider>
  );

describe('MovieRow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should ask for confirmation before deleting', () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'deleteButton Ran' }));

    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'confirmDeleteTitle'
    );
    expect(mockDeleteFromPrisma).not.toHaveBeenCalled();
  });

  it('should delete the movie once confirmed', () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'deleteButton Ran' }));
    fireEvent.click(screen.getByRole('button', { name: 'deleteButton' }));

    expect(mockDeleteFromPrisma).toHaveBeenCalledWith('movie-1');
  });

  it('should not delete when cancelled', () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'deleteButton Ran' }));
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockDeleteFromPrisma).not.toHaveBeenCalled();
  });

  it('should render nothing for a movie without id', () => {
    const { container } = renderRow({ movie: { title: 'x' } as IMovie });

    expect(container.querySelector('tr')).toBeNull();
  });
});
