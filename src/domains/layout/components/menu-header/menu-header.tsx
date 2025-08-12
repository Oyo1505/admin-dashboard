import { User } from '@/domains/layout/components/menu-user-items/menu-user-items';
import Container from '@/domains/ui/components/container/container';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import {
  URL_DASHBOARD,
  URL_HOME,
  URL_MOVIES,
  URL_RESSOURCES,
} from '@/shared/route';
import { Session } from 'next-auth';
import { headers } from 'next/headers';
import MenuHeaderItem from '../menu-header-item/menu-header-item';
import MenuMobile from '../menu-mobile/menu-mobile';

const MenuHeader = async ({ session }: { session: Session | null }) => {
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );

  return isMobileView ? (
    <MenuMobile session={session as Session | null} />
  ) : (
    <header className="group fixed w-full top-0 flex h-15  pt-2 pb-2 items-center gap-4 bg-background opacity-90  z-20 justify-between lg:justify-between">
      <Container className="flex flex-row items-center w-full justify-between gap-5">
        <div className="flex items-center justify-start gap-5 ">
          {session && (
            <>
              <MenuHeaderItem pathname={URL_HOME} translation="home" />
              <MenuHeaderItem pathname={URL_MOVIES} translation="movies" />
              <MenuHeaderItem
                pathname={URL_RESSOURCES}
                translation="ressources"
              />
              <MenuHeaderItem
                pathname={URL_DASHBOARD}
                translation="dashboard"
              />
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-5">
          <User mobile={false} />
          <LocaleSwitcher />
        </div>
      </Container>
    </header>
  );
};

export default MenuHeader;
