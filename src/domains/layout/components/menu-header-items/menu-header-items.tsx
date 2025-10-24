'use client';

import { useSession } from '@/lib/auth-client';
import {
  URL_DASHBOARD,
  URL_HOME,
  URL_MOVIES,
  URL_RESSOURCES,
} from '@/shared/route';
import MenuHeaderItem from '../menu-header-item/menu-header-item';

const MenuHeaderItems = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-start gap-5 ">
      {session && (
        <>
          <MenuHeaderItem pathname={URL_HOME} translation="home" />
          <MenuHeaderItem pathname={URL_MOVIES} translation="movies" />
          <MenuHeaderItem pathname={URL_RESSOURCES} translation="ressources" />
          <MenuHeaderItem pathname={URL_DASHBOARD} translation="dashboard" />
        </>
      )}
    </div>
  );
};

export default MenuHeaderItems;
