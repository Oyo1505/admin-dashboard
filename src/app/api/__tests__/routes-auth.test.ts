/**
 * @jest-environment node
 */
import { DALError } from '@/lib/data/dal/core/errors';
import { GET as getApplicationVisits } from '../analytics/get-analytics-application-visits/route';
import { GET as getAllUsersVisits } from '../analytics/get-all-analytics-users-visits/route';
import { GET as getAuthorizedEmails } from '../analytics/get-authorized-emails-pagination/route';
import { GET as getTmdbMovie } from '../tmdb/[id]/route';
import { GET as getUserConnected } from '../users/get-user-connected/[email]/route';

const mockVerifyAdmin = jest.fn();
const mockVerifySession = jest.fn();
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/data/dal/core/auth', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
  verifySession: () => mockVerifySession(),
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock('@/lib/errors', () => ({ logError: jest.fn() }));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    analyticsApplication: { findFirst: jest.fn().mockResolvedValue(null) },
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({
        id: 'u1',
        email: 'me@test.fr',
        role: 'USER',
      }),
    },
    authorizedEmail: { findMany: jest.fn().mockResolvedValue([]) },
  },
}));

jest.mock('@/lib/data/analytics', () => ({
  AnalyticsData: {
    getAnalyticsUser: jest.fn().mockResolvedValue({ analytics: [] }),
  },
}));

const forbidden = new DALError('FORBIDDEN', 'Admin privileges required');
const unauthorized = new DALError('UNAUTHORIZED', 'Not authenticated');

const adminRoutes = [
  ['get-analytics-application-visits', () => getApplicationVisits()],
  ['get-all-analytics-users-visits', () => getAllUsersVisits()],
  [
    'get-authorized-emails-pagination',
    () => getAuthorizedEmails(new Request('http://localhost/api?pageParam=0')),
  ],
] as const;

describe('Admin-only API routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(adminRoutes)('%s returns 403 for a non-admin', async (_, call) => {
    mockVerifyAdmin.mockRejectedValue(forbidden);

    const response = await call();

    expect(response.status).toBe(403);
  });

  it.each(adminRoutes)('%s returns 200 for an admin', async (_, call) => {
    mockVerifyAdmin.mockResolvedValue({ id: 'a1', role: 'ADMIN' });

    const response = await call();

    expect(response.status).toBe(200);
  });
});

describe('GET /api/tmdb/[id]', () => {
  it('returns 401 without a session and does not call TMDB', async () => {
    mockVerifySession.mockRejectedValue(unauthorized);
    global.fetch = jest.fn();

    const response = await getTmdbMovie(
      new Request('http://localhost/api/tmdb/tt0094625'),
      { params: Promise.resolve({ id: 'tt0094625' }) }
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('GET /api/users/get-user-connected/[email]', () => {
  const call = (email: string) =>
    getUserConnected(new Request('http://localhost'), {
      params: Promise.resolve({ email }),
    });

  it('returns 401 without a session', async () => {
    mockGetCurrentUser.mockRejectedValue(unauthorized);

    expect((await call('me@test.fr')).status).toBe(401);
  });

  it("returns 403 when a user reads someone else's data", async () => {
    mockGetCurrentUser.mockResolvedValue({ email: 'me@test.fr', role: 'USER' });

    expect((await call('other@test.fr')).status).toBe(403);
  });

  it('returns 200 for the user own data', async () => {
    mockGetCurrentUser.mockResolvedValue({ email: 'me@test.fr', role: 'USER' });

    expect((await call('me@test.fr')).status).toBe(200);
  });

  it('returns 200 for an admin reading any user', async () => {
    mockGetCurrentUser.mockResolvedValue({ email: 'a@test.fr', role: 'ADMIN' });

    expect((await call('me@test.fr')).status).toBe(200);
  });
});
