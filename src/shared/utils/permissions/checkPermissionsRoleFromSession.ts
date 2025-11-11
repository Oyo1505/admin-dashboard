import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';
import HttpStatus from '@/shared/constants/httpStatus';

const checkPermissionsRoleFromSession = async () => {
  const session = await getServerSession();

  if (!session?.user) {
    return { status: HttpStatus.UNAUTHORIZED, message: 'Session invalide' };
  }

  // Better Auth session doesn't include role by default, need to fetch from DB
  const prisma = (await import('@/lib/prisma')).default;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  if (!dbUser) {
    return { status: HttpStatus.NOT_FOUND, message: 'Utilisateur non trouvé' };
  }

  const user: SelectUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image ?? undefined,
    role: dbUser.role as 'USER' | 'ADMIN',
  };

  if (user.role !== 'ADMIN') {
    return { status: HttpStatus.FORBIDDEN, message: 'Droits administrateur requis' };
  }
  return { status: HttpStatus.OK, user };
};
export default checkPermissionsRoleFromSession;
