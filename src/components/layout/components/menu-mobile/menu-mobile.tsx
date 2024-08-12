'use client'
import LocaleSwitcher from '@/components/ui/components/LocaleSwitcher/locale-switcher';
import { useTranslations } from 'next-intl';
import React from 'react'
import MenuMobileItem from '../menu-mobile-item/menu-mobile-item';
import { User } from '@/app/user';

const MenuMobile= ({session}: {session: any}) => {
  const t = useTranslations('Menu');
  const [isActive, setIsActive] = React.useState(false);
  return (
    <div className="flex items-center pl-3 justify-between border-b border-gray-400 py-8">
      <nav>
        <section className=" flex lg:hidden">
          <div
            className="space-y-2"
            onClick={() => setIsActive(!isActive)} // toggle isNavOpen state on click
          >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>

          </div>

          <div className={isActive ? "showMenuNav" : "hideMenuNav"}> 
            <div
              className="absolute top-0 right-0 px-8 py-8"
              onClick={() => setIsActive(!isActive)} // change isNavOpen state to false to close the menu
            >
              <svg
                className="h-8 w-8 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <ul className="flex flex-col items-center justify-between min-h-[250px]">
              <MenuMobileItem session={session} setIsActive={setIsActive} isActive={isActive} />
                <User />
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
        position: absolute;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        background: white;
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