import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';

const checkPermissionsRoleFromSession = async () => {
  const session = await getServerSession();

  if (!session?.user) {
    return { status: 401, message: 'Session invalide' };
  }

  // Better Auth session doesn't include role by default, need to fetch from DB
  const prisma = (await import('@/lib/prisma')).default;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  if (!dbUser) {
    return { status: 404, message: 'Utilisateur non trouvé' };
  }

  const user: SelectUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image ?? undefined,
    role: dbUser.role as 'USER' | 'ADMIN',
  };

  if (user.role !== 'ADMIN') {
    return { status: 403, message: 'Droits administrateur requis' };
  }
  return { status: 200, user };
};
export default checkPermissionsRoleFromSession;
