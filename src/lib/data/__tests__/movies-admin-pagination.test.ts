import prisma from '@/lib/prisma';
import { logError } from '@/lib/errors';
import { ADMIN_MOVIES_PAGE_SIZE } from '@/shared/constants/pagination';
import { buildAdminMoviesWhere } from '../movies-helpers';
import { MovieData } from '../movies';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    movie: { count: jest.fn(), findMany: jest.fn() },
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn(() => ({ statusCode: 500 })),
  logError: jest.fn(),
}));

describe('buildAdminMoviesWhere', () => {
  it('should return an empty filter by default', () => {
    expect(buildAdminMoviesWhere()).toEqual({});
    expect(buildAdminMoviesWhere('   ', 'all')).toEqual({});
  });

  it('should search case-insensitively on titles and director', () => {
    const where = buildAdminMoviesWhere('  mononoke ');

    expect(where.OR).toEqual([
      { title: { contains: 'mononoke', mode: 'insensitive' } },
      { originalTitle: { contains: 'mononoke', mode: 'insensitive' } },
      { titleEnglish: { contains: 'mononoke', mode: 'insensitive' } },
      { titleJapanese: { contains: 'mononoke', mode: 'insensitive' } },
      { director: { contains: 'mononoke', mode: 'insensitive' } },
    ]);
  });

  it.each([
    ['published', true],
    ['unpublished', false],
  ] as const)('should filter %s movies', (publish, expected) => {
    expect(buildAdminMoviesWhere(undefined, publish)).toEqual({
      publish: expected,
    });
  });

  it('should combine search and publish filter', () => {
    const where = buildAdminMoviesWhere('kurosawa', 'published');

    expect(where.publish).toBe(true);
    expect(where.OR).toHaveLength(5);
  });
});

describe('MovieData.findPaginatedForAdmin', () => {
  beforeEach(() => {
    (prisma.$transaction as jest.Mock).mockImplementation((queries) =>
      Promise.all(queries)
    );
  });

  it('should return movies and total for the requested page', async () => {
    const movies = [{ id: '1', title: 'Ran' }];
    (prisma.movie.count as jest.Mock).mockResolvedValue(42);
    (prisma.movie.findMany as jest.Mock).mockResolvedValue(movies);

    const result = await MovieData.findPaginatedForAdmin({
      page: 2,
      search: 'ran',
      publish: 'published',
    });

    const where = buildAdminMoviesWhere('ran', 'published');
    expect(prisma.movie.count).toHaveBeenCalledWith({ where });
    expect(prisma.movie.findMany).toHaveBeenCalledWith({
      where,
      orderBy: { createdAt: 'desc' },
      skip: 2 * ADMIN_MOVIES_PAGE_SIZE,
      take: ADMIN_MOVIES_PAGE_SIZE,
    });
    expect(result).toEqual({ movies, total: 42, status: 200 });
  });

  it('should return the Prisma error status on failure', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('db'));

    const result = await MovieData.findPaginatedForAdmin({ page: 0 });

    expect(result).toEqual({ status: 500 });
    expect(logError).toHaveBeenCalled();
  });
});
