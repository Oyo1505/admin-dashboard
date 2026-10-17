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

const mockFindMovieIdByImdbId = jest.fn();
const mockGetMovieDetails = jest.fn();
jest.mock('@/lib/data/tmdb', () => ({
  TmdbData: {
    findMovieIdByImdbId: (...args: unknown[]) =>
      mockFindMovieIdByImdbId(...args),
    getMovieDetails: (...args: unknown[]) => mockGetMovieDetails(...args),
  },
}));

const callRoute = (imdbId: string) =>
  GET(new Request(`http://localhost/api/tmdb/prefill/${imdbId}`), {
    params: Promise.resolve({ imdbId }),
  });

describe('GET /api/tmdb/prefill/[imdbId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  it('should return 403 when user is not admin', async () => {
    mockVerifyAdmin.mockRejectedValue(
      new DALError('FORBIDDEN', 'Admin privileges required')
    );

    const response = await callRoute('tt0119698');

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(mockFindMovieIdByImdbId).not.toHaveBeenCalled();
  });

  it('should return 400 for an invalid IMDb id', async () => {
    const response = await callRoute('invalid');

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(mockFindMovieIdByImdbId).not.toHaveBeenCalled();
  });

  it('should return 404 when TMDB has no matching movie', async () => {
    mockFindMovieIdByImdbId.mockResolvedValue(null);

    const response = await callRoute('tt0119698');

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should return 502 when TMDB details fail', async () => {
    mockFindMovieIdByImdbId.mockResolvedValue(128);
    mockGetMovieDetails.mockResolvedValue(null);

    const response = await callRoute('tt0119698');

    expect(response.status).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('should return mapped form values', async () => {
    mockFindMovieIdByImdbId.mockResolvedValue(128);
    mockGetMovieDetails.mockImplementation((_id: number, language: string) =>
      Promise.resolve({
        id: 128,
        title: {
          'fr-FR': 'Princesse Mononoké',
          'en-US': 'Princess Mononoke',
          'ja-JP': 'もののけ姫',
        }[language],
        runtime: 134,
      })
    );

    const response = await callRoute('tt0119698');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetMovieDetails).toHaveBeenCalledWith(128, 'fr-FR', true);
    expect(data).toEqual({
      title: 'Princesse Mononoké',
      titleEnglish: 'Princess Mononoke',
      titleJapanese: 'もののけ姫',
      duration: 134,
    });
  });

  it('should return 500 on unexpected errors', async () => {
    mockFindMovieIdByImdbId.mockRejectedValue(new Error('network'));

    const response = await callRoute('tt0119698');

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
