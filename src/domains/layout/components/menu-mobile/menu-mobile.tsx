'use client'
import { User } from '@/domains/layout/components/menu-user-items/menu-user-items';
import { BurgerIcon, CrossIcon } from '@/domains/ui/components/icons/icons';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import clsx from 'clsx';
import { Session } from 'next-auth';
import { useState } from 'react';
import MenuMobileItem from '../menu-mobile-item/menu-mobile-item';

const MenuMobile= ({session}: {session: Session | null}) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="flex pl-6 items-centerpl-3 justify-between shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] py-8">
      <nav >
        <section className="flex lg:hidden">
          <div
            className="space-y-2"
            onClick={() => setIsActive(!isActive)}
          >
          <BurgerIcon />
          </div>
          <div className={clsx(isActive ? "showMenuNav" : "hideMenuNav")}>
            <div
              className="absolute top-0 right-0 px-8 py-8"
              onClick={() => setIsActive(!isActive)} >
              <CrossIcon />
            </div>
            <ul className="flex flex-col items-center justify-between min-h-[250px] text-primary">
              <MenuMobileItem session={session} setIsActive={setIsActive} isActive={isActive} />
              <User mobile={true} />
              <LocaleSwitcher />
            </ul>
          </div>
        </section>
      </nav>
      <style>{`
      .hideMenuNav {
        display: none;
      }
      .showMenuNav {
        display: block;
        position: fixed;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        background: #121212;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
      }
    `}</style>
    </div>
  );
}

export default MenuMobile
