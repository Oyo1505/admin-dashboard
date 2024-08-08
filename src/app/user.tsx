
import Image from 'next/image';
import ButtonLogout from '../components/ui/components/button-logout/button-logout';
import { auth } from '@/lib/auth';

export async function User() {
  const session = await auth();
  const user = session?.user;
  return (
    user &&
    <div className="flex items-center gap-4">
      <ButtonLogout />
      <Image
        className="h-8 w-8 rounded-full"
        src={user?.image!}
        height={32}
        width={32}
        alt={`${user?.name} avatar`}
      />
    </div>
  );
}
