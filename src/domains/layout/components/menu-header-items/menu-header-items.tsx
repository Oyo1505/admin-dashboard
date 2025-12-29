'use client';

import { useSession } from '@/lib/auth-client';
import {
  URL_DASHBOARD,
  URL_HOME,
  URL_MOVIES,
  URL_RESSOURCES,
} from '@/shared/route';
import { Activity } from 'react';
import MenuHeaderItem from '../menu-header-item/menu-header-item';

const MenuHeaderItems = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-start gap-5 ">
      <Activity mode={session ? 'visible' : 'hidden'}>
        <MenuHeaderItem pathname={URL_HOME} translation="home" />
        <MenuHeaderItem pathname={URL_MOVIES} translation="movies" />
        <MenuHeaderItem pathname={URL_RESSOURCES} translation="ressources" />
        <MenuHeaderItem pathname={URL_DASHBOARD} translation="dashboard" />
      </Activity>
    </div>
  );
};

export default MenuHeaderItems;
