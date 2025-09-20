import { UserSession, auth } from '@/lib/auth';
import { User } from '@/models/user/user';

const userPermissions = {
  ADMIN: [
    'can:delete:user',
    'can:create:user',
    'can:update:user',
    'can:read:user',
    'can:delete:movie',
    'can:create:movie',
    'can:update:movie',
    'can:read:movie',
    'can:delete:genre',
    'can:create:genre',
    'can:update:genre',
    'can:read:genre',
    'can:delete:director',
    'can:create:director',
    'can:update:director',
    'can:read:director',
    'can:viewAnalyticsAdmin:dashboard',
  ],
  USER: [
    'can:read:user',
    'can:read:movie',
    'can:delete:hisAccount',
    'can:update:hisAccount',
    'can:viewAnalyticsUser:dashboard',
  ],
};
const checkPermissions = (user: User, action: string, resource: string) => {
  const permissions =
    userPermissions[user.role as keyof typeof userPermissions];
  if (!permissions) return false;
  return permissions?.includes(`${action}:${resource}`);
};

const checkPermissionsRoleFromSession = async () => {
  const session = await auth();

  if (!session?.user) {
    return { status: 401, message: 'Session invalide' };
  }
  const user = session.user as UserSession;
  console.log(user.role);
  if (user.role !== 'ADMIN') {
    return { status: 403, message: 'Droits administrateur requis' };
  }
  return { status: 200, user };
};
export { checkPermissions, checkPermissionsRoleFromSession };
