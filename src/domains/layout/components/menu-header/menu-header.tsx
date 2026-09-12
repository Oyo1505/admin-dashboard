import Container from '@/domains/ui/components/container/container';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import { getServerSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { Activity } from 'react';
import MenuHeaderItems from '../menu-header-items/menu-header-items';
import MenuMobile from '../menu-mobile/menu-mobile';
import { User } from '../menu-user-items/menu-user-items';

const MenuHeader = async () => {
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  // Resolved server-side so the first client render (pre-hydration) has the
  // exact same session-derived markup as the SSR output. `useSession()` on
  // the client can resolve synchronously from Better Auth's cookie cache,
  // which otherwise diverges from the server (no cookie access) and throws
  // a hydration mismatch.
  const session = await getServerSession();
  const hasSession = Boolean(session?.user);

  return (
    <>
      <MenuMobile isMobileView={Boolean(isMobileView)} />
      <Activity mode={isMobileView ? 'hidden' : 'visible'}>
        <header className="group fixed w-full top-0 md:flex h-15  pt-2 pb-2 items-center gap-4 bg-background z-20 justify-between lg:justify-between hidden">
          <Container className="flex flex-row items-center w-full justify-between gap-5">
            <MenuHeaderItems hasSession={hasSession} />
            <div className="flex items-center justify-end gap-5">
              <User
                mobile={Boolean(isMobileView)}
                initialUser={
                  session?.user
                    ? { name: session.user.name, image: session.user.image }
                    : null
                }
              />
              <LocaleSwitcher />
            </div>
          </Container>
        </header>
      </Activity>
    </>
  );
};

export default MenuHeader;
