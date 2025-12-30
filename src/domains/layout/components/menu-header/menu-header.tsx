import { User } from '@/domains/layout/components/menu-user-items/menu-user-items';
import Container from '@/domains/ui/components/container/container';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import { headers } from 'next/headers';
import MenuHeaderItems from '../menu-header-items/menu-header-items';
import MenuMobile from '../menu-mobile/menu-mobile';

const MenuHeader = async () => {
  const userAgent = (await headers()).get('user-agent');
  const isMobileView = userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );

  return (
    <>
      {isMobileView ? (
        <MenuMobile />
      ) : (
        <header className="group fixed w-full top-0 flex h-15  pt-2 pb-2 items-center gap-4 bg-background z-20 justify-between lg:justify-between">
          <Container className="flex flex-row items-center w-full justify-between gap-5">
            <MenuHeaderItems />
            <div className="flex items-center justify-end gap-5">
              <User mobile={isMobileView ? true : false} />
              <LocaleSwitcher />
            </div>
          </Container>
        </header>
      )}
    </>
  );
};

export default MenuHeader;
