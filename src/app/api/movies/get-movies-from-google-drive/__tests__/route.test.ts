import { getDataFromGoogleDrive } from '@/googleDrive';
import { MovieData } from '@/lib/data/movies';
import { logError } from '@/lib/errors';
import { GET } from '../route';

// Mock dependencies
jest.mock('@/lib/data/movies');
jest.mock('@/googleDrive');
jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

// Mock Response.json for Node.js environment
global.Response = class Response {
  private body: unknown;
  public status: number;

  constructor(body: unknown, init?: { status?: number }) {
    this.body = body;
    this.status = init?.status || 200;
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  static json(data: unknown, init?: { status?: number }) {
    return new Response(data, init);
  }
} as never;

describe('GET /api/movies/get-movies-from-google-drive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Success scenarios', () => {
    it('should return filtered movies not in database', async () => {
      // Arrange: Setup mock data
      const mockGoogleMovies = [
        { id: 'drive-1', title: 'Movie 1', year: 2023 },
        { id: 'drive-2', title: 'Movie 2', year: 2024 },
        { id: 'drive-3', title: 'Movie 3', year: 2025 },
      ];

      const mockDbMovies = [
        {
          id: '1',
          idGoogleDive: 'drive-1',
          title: 'Movie 1',
          year: 2023,
        },
      ];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: mockDbMovies,
        status: 200,
      });

      // Act: Call the API endpoint
      const response = await GET();
      const data = await response.json();

      // Assert: Verify filtered results
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toBeDefined();
      expect(data.filteredMoviesNotAdded).toHaveLength(2);
      expect(data.filteredMoviesNotAdded[0].id).toBe('drive-2');
      expect(data.filteredMoviesNotAdded[1].id).toBe('drive-3');

      // Verify correct calls
      expect(getDataFromGoogleDrive).toHaveBeenCalledTimes(1);
      expect(MovieData.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return all movies when database is empty', async () => {
      // Arrange: Empty database
      const mockGoogleMovies = [
        { id: 'drive-1', title: 'Movie 1' },
        { id: 'drive-2', title: 'Movie 2' },
      ];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: [],
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert: All movies should be returned
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toHaveLength(2);
    });

    it('should return empty array when all movies are in database', async () => {
      // Arrange: All movies already in database
      const mockGoogleMovies = [
        { id: 'drive-1', title: 'Movie 1' },
        { id: 'drive-2', title: 'Movie 2' },
      ];

      const mockDbMovies = [
        { id: '1', idGoogleDive: 'drive-1', title: 'Movie 1' },
        { id: '2', idGoogleDive: 'drive-2', title: 'Movie 2' },
      ];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: mockDbMovies,
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert: No new movies
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toHaveLength(0);
    });

    it('should filter out movies with null/undefined idGoogleDive', async () => {
      // Arrange: Movies with null IDs should be excluded
      const mockGoogleMovies = [
        { id: 'drive-1', title: 'Movie 1' },
        { id: undefined, title: 'Movie 2' }, // Should be filtered
        { id: null, title: 'Movie 3' }, // Should be filtered
      ];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: [],
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert: Only valid movie returned
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toHaveLength(1);
      expect(data.filteredMoviesNotAdded[0].id).toBe('drive-1');
    });
  });

  describe('Error scenarios', () => {
    it('should return 404 when Google Drive returns no data', async () => {
      // Arrange: Null response from Google Drive
      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.movies).toEqual([]);
      expect(MovieData.getAll).not.toHaveBeenCalled();
    });

    it('should return 404 when Google Drive returns undefined', async () => {
      // Arrange: Undefined response
      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.movies).toEqual([]);
    });

    it('should return 404 when MovieData returns no movies', async () => {
      // Arrange: Valid Google Drive data but no database movies
      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: [{ id: 'drive-1', title: 'Movie 1' }],
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: null,
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.movies).toEqual([]);
    });

    it('should handle Google Drive API errors', async () => {
      // Arrange: Google Drive throws error
      const mockError = new Error('Google Drive API error');
      (getDataFromGoogleDrive as jest.Mock).mockRejectedValue(mockError);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'get-movies-from-google-drive'
      );
    });

    it('should handle MovieData.getAll errors', async () => {
      // Arrange: Database error
      const mockError = new Error('Database connection failed');

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: [{ id: 'drive-1', title: 'Movie 1' }],
      });

      (MovieData.getAll as jest.Mock).mockRejectedValue(mockError);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'get-movies-from-google-drive'
      );
    });

    it('should handle unexpected errors during filtering', async () => {
      // Arrange: Setup to cause error in filtering logic
      const mockGoogleMovies = [{ id: 'drive-1', title: 'Movie 1' }];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      // Return invalid data structure to trigger error
      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: 'invalid-data', // This will cause map() to fail
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty movies array from Google Drive', async () => {
      // Arrange
      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: [],
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: [],
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toEqual([]);
    });

    it('should handle movies with duplicate Google Drive IDs', async () => {
      // Arrange: Same movie ID appears multiple times
      const mockGoogleMovies = [
        { id: 'drive-1', title: 'Movie 1' },
        { id: 'drive-1', title: 'Movie 1 Duplicate' }, // Duplicate
      ];

      const mockDbMovies = [
        { id: '1', idGoogleDive: 'drive-1', title: 'Movie 1' },
      ];

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: mockDbMovies,
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert: Both duplicates should be filtered out
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toHaveLength(0);
    });

    it('should handle large dataset efficiently', async () => {
      // Arrange: Large number of movies
      const mockGoogleMovies = Array.from({ length: 1000 }, (_, i) => ({
        id: `drive-${i}`,
        title: `Movie ${i}`,
      }));

      const mockDbMovies = Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        idGoogleDive: `drive-${i}`,
        title: `Movie ${i}`,
      }));

      (getDataFromGoogleDrive as jest.Mock).mockResolvedValue({
        movies: mockGoogleMovies,
      });

      (MovieData.getAll as jest.Mock).mockResolvedValue({
        movies: mockDbMovies,
        status: 200,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert: Should return 500 new movies (1000 - 500)
      expect(response.status).toBe(200);
      expect(data.filteredMoviesNotAdded).toHaveLength(500);
      expect(data.filteredMoviesNotAdded[0].id).toBe('drive-500');
    });
  });
});
