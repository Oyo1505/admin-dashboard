import { verifyAdmin } from '../auth';
import { DALError } from '../errors';

describe('verifyAdmin', () => {
  it('should throw FORBIDDEN when user is not admin', async () => {
    mockGetServerSession({ user: { role: 'USER' } });

    await expect(verifyAdmin()).rejects.toThrow(DALError);
    await expect(verifyAdmin()).rejects.toMatchObject({
      type: 'FORBIDDEN',
    });
  });

  it('should return user when admin', async () => {
    mockGetServerSession({ user: { role: 'ADMIN' } });

    const user = await verifyAdmin();
    expect(user.role).toBe('ADMIN');
  });
});
