'use client';
import { BurgerIcon, CrossIcon } from '@/domains/ui/components/icons/icons';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import clsx from 'clsx';
import { Activity, useState } from 'react';
import MenuMobileItem from '../menu-mobile-item/menu-mobile-item';
import { User } from '../menu-user-items/menu-user-items';

const MenuMobile = ({ isMobileView }: { isMobileView: boolean }) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <Activity mode={isMobileView ? 'visible' : 'hidden'}>
      <div className="flex pl-6 items-centerpl-3 justify-between shadow-[rgba(50,50,105,0.15)_0px_2px_5px_0px,rgba(0,0,0,0.05)_0px_1px_1px_0px] py-8 ">
        <nav>
          <section className="flex lg:hidden">
            <button
              onClick={() => setIsActive(!isActive)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsActive(!isActive);
                }
              }}
              aria-expanded={isActive}
              aria-label={
                isActive
                  ? 'Fermer le menu de navigation'
                  : 'Ouvrir le menu de navigation'
              }
              aria-controls="mobile-menu"
              className="space-y-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BurgerIcon />
            </button>
            <div
              id="mobile-menu"
              className={clsx(isActive ? 'showMenuNav' : 'hideMenuNav')}
              role="dialog"
              aria-modal="true"
            >
              <button
                className="absolute top-0 right-0 px-8 py-8"
                onClick={() => setIsActive(false)}
                aria-label="Fermer le menu"
              >
                <CrossIcon />
              </button>
              <ul className="flex flex-col items-center justify-between mmin-h-62.5 text-primary md:hidden">
                <MenuMobileItem setIsActive={setIsActive} isActive={isActive} />
                <User mobile={isMobileView} />
                <LocaleSwitcher />
              </ul>
            </div>
          </section>
        </nav>
      </div>
    </Activity>
  );
};

export default MenuMobile;
