import { act, fireEvent, render, screen } from '@testing-library/react';
import MovieTable from '../movie-table';

const mockUseGetMoviesPagination = jest.fn();
jest.mock('@/domains/movies/hooks/use-get-movies-pagination', () => ({
  __esModule: true,
  default: (args: unknown) => mockUseGetMoviesPagination(args),
}));

jest.mock('../../../hooks/useGetMoviesFromGoogleDrive', () => ({
  __esModule: true,
  default: () => ({ data: [], isLoading: false }),
}));

jest.mock('../../movie-row/movie-row', () => ({
  __esModule: true,
  default: ({ movie }: { movie: { title: string } }) => (
    <tr>
      <td>{movie.title}</td>
    </tr>
  ),
}));

jest.mock('@/app/loading', () => ({
  __esModule: true,
  default: () => <p>loading</p>,
}));

const mockMovies = (movies: { id: string; title: string }[], total: number) =>
  mockUseGetMoviesPagination.mockReturnValue({
    data: { movies, total },
    isPlaceholderData: false,
    isFetching: false,
  });

describe('MovieTable', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should render movies and pagination from the total', () => {
    mockMovies([{ id: '1', title: 'Ran' }], 25);

    render(<MovieTable />);

    expect(screen.getByText('Ran')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(mockUseGetMoviesPagination).toHaveBeenLastCalledWith({
      page: 0,
      search: '',
      publish: 'all',
    });
  });

  it('should reset to the first page and query the debounced search', () => {
    mockMovies([{ id: '1', title: 'Ran' }], 25);
    render(<MovieTable />);

    fireEvent.click(screen.getByRole('button', { name: 'nextPage' }));
    expect(mockUseGetMoviesPagination).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 })
    );

    fireEvent.change(screen.getByLabelText('searchLabel'), {
      target: { value: 'kuro' },
    });
    act(() => jest.advanceTimersByTime(300));

    expect(mockUseGetMoviesPagination).toHaveBeenLastCalledWith({
      page: 0,
      search: 'kuro',
      publish: 'all',
    });
  });

  it('should reset to the first page when changing the publish filter', () => {
    mockMovies([{ id: '1', title: 'Ran' }], 25);
    render(<MovieTable />);

    fireEvent.click(screen.getByRole('button', { name: 'nextPage' }));
    fireEvent.change(screen.getByLabelText('publishFilterLabel'), {
      target: { value: 'published' },
    });

    expect(mockUseGetMoviesPagination).toHaveBeenLastCalledWith({
      page: 0,
      search: '',
      publish: 'published',
    });
  });

  it('should show the no results message for a search', () => {
    mockMovies([], 0);
    render(<MovieTable />);

    fireEvent.change(screen.getByLabelText('searchLabel'), {
      target: { value: 'zzz' },
    });
    act(() => jest.advanceTimersByTime(300));

    expect(screen.getByText('noResults')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should show the empty message without search', () => {
    mockMovies([], 0);
    render(<MovieTable />);

    expect(screen.getByText('noMovie')).toBeInTheDocument();
  });
});
