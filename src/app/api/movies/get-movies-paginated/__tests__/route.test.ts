/**
 * @jest-environment node
 */
import { DALError } from '@/lib/data/dal/core/errors';
import HttpStatus from '@/shared/constants/httpStatus';
import { GET } from '../route';

const mockVerifyAdmin = jest.fn();
jest.mock('@/lib/data/dal/core/auth', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

const mockFindPaginatedForAdmin = jest.fn();
jest.mock('@/lib/data/movies', () => ({
  MovieData: {
    findPaginatedForAdmin: (...args: unknown[]) =>
      mockFindPaginatedForAdmin(...args),
  },
}));

const callRoute = (query = '') =>
  GET(new Request(`http://localhost/api/movies/get-movies-paginated${query}`));

describe('GET /api/movies/get-movies-paginated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    mockFindPaginatedForAdmin.mockResolvedValue({
      movies: [{ id: '1' }],
      total: 1,
      status: HttpStatus.OK,
    });
  });

  it('should return 403 when user is not admin', async () => {
    mockVerifyAdmin.mockRejectedValue(
      new DALError('FORBIDDEN', 'Admin privileges required')
    );

    const response = await callRoute();

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(mockFindPaginatedForAdmin).not.toHaveBeenCalled();
  });

  it('should use default parameters', async () => {
    const response = await callRoute();

    expect(response.status).toBe(HttpStatus.OK);
    expect(mockFindPaginatedForAdmin).toHaveBeenCalledWith({
      page: 0,
      search: '',
      publish: 'all',
    });
    expect(await response.json()).toEqual({ movies: [{ id: '1' }], total: 1 });
  });

  it('should pass trimmed search, page and publish filter', async () => {
    await callRoute('?page=3&search=%20ran%20&publish=unpublished');

    expect(mockFindPaginatedForAdmin).toHaveBeenCalledWith({
      page: 3,
      search: 'ran',
      publish: 'unpublished',
    });
  });

  it.each([
    '?page=-1',
    '?page=1.5',
    '?page=abc',
    '?publish=draft',
    `?search=${'a'.repeat(101)}`,
  ])('should return 400 for invalid query %s', async (query) => {
    const response = await callRoute(query);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(mockFindPaginatedForAdmin).not.toHaveBeenCalled();
  });

  it('should forward data layer error status', async () => {
    mockFindPaginatedForAdmin.mockResolvedValue({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const response = await callRoute();

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return 500 on unexpected errors', async () => {
    mockFindPaginatedForAdmin.mockRejectedValue(new Error('boom'));

    const response = await callRoute();

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
