'use client';
import { useSession } from '@/lib/auth-client';
import {
  URL_DASHBOARD,
  URL_HOME,
  URL_MOVIES,
  URL_RESSOURCES,
} from '@/shared/route';
import { useEffect, useState } from 'react';
import MenuHeaderItem from '../menu-header-item/menu-header-item';

const MenuHeaderItems = ({ hasSession }: { hasSession: boolean }) => {
  const { data: session } = useSession();
  // Better Auth's `useSession` can resolve synchronously from its cookie
  // cache on the client, which the server render can't see (no cookie
  // access). Rely on the server-computed `hasSession` for the very first
  // render (matching SSR exactly) and only switch to the live/reactive
  // value once mounted, so hydration never diffs against a moving target.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showItems = mounted ? Boolean(session?.user) : hasSession;

  return (
    <div className="flex items-center justify-start gap-5 ">
      {showItems && <>
        <MenuHeaderItem pathname={URL_HOME} translation="home" />
        <MenuHeaderItem pathname={URL_MOVIES} translation="movies" />
        <MenuHeaderItem pathname={URL_RESSOURCES} translation="ressources" />
        <MenuHeaderItem pathname={URL_DASHBOARD} translation="dashboard" />
        </>
      }
    </div>
  );
};

export default MenuHeaderItems;
