import { IMovie } from '@/models/movie/movie';
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
    <table>
      <tbody>
        <MovieRow movie={movie} btnText="editButton" {...props} />
      </tbody>
    </table>
  );

describe('MovieRow', () => {
  it('should delete the movie on click without needing a parent form', () => {
    renderRow();

    const button = screen.getByRole('button', { name: 'deleteButton Ran' });
    expect(button).toHaveAttribute('type', 'button');

    fireEvent.click(button);

    expect(mockDeleteFromPrisma).toHaveBeenCalledWith('movie-1');
  });

  it('should include the visible text in the delete button accessible name', () => {
    renderRow();

    const button = screen.getByRole('button', { name: /^deleteButton/ });
    expect(button).toHaveTextContent('deleteButton');
  });
});
