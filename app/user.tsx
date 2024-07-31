import { Button } from '@/components/ui/button';
import ButtonLogout from '@/components/ui/components/button-logout/button-logout';
import { auth, signIn, signOut } from '@/lib/auth';
import Image from 'next/image';

export async function User() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <form
        action={async () => {
          'use server';
          await signIn('google');
        }}
      >
        <Button variant="outline">Sign In</Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ButtonLogout />
      <Image
        className="h-8 w-8 rounded-full"
        src={user.image!}
        height={32}
        width={32}
        alt={`${user.name} avatar`}
      />
    </div>
  );
}
