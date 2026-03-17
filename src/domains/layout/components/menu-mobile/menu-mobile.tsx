'use client';
import { BurgerIcon, CrossIcon } from '@/domains/ui/components/icons/icons';
import LocaleSwitcher from '@/domains/ui/components/locale-switcher/locale-switcher';
import { URL_BASE } from '@/shared/route';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { Activity, useEffect, useRef, useState } from 'react';
import MenuMobileItem from '../menu-mobile-item/menu-mobile-item';
import { User } from '../menu-user-items/menu-user-items';

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MenuMobile = ({ isMobileView }: { isMobileView: boolean }) => {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === URL_BASE;
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive) {
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      firstFocusable?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isActive]);

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsActive(false);
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS) ??
        []
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <Activity mode={isMobileView && !isHomePage ? 'visible' : 'hidden'}>
      <div className="flex items-center pl-3 justify-between shadow-[rgba(50,50,105,0.15)_0px_2px_5px_0px,rgba(0,0,0,0.05)_0px_1px_1px_0px] py-8">
        <div className="flex lg:hidden">
          <button
            ref={triggerRef}
            onClick={() => setIsActive(!isActive)}
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
            ref={dialogRef}
            className={clsx(isActive ? 'showMenuNav' : 'hideMenuNav')}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            onKeyDown={handleDialogKeyDown}
          >
            <button
              className="absolute top-0 right-0 px-8 py-8"
              onClick={() => setIsActive(false)}
              aria-label="Fermer le menu"
            >
              <CrossIcon />
            </button>
            <ul className="flex flex-col items-center gap-10 text-primary">
              <MenuMobileItem setIsActive={setIsActive} />
              <li
                className="w-16 border-t border-white/10"
                aria-hidden="true"
              />
              <li>
                <User mobile={isMobileView} />
              </li>
              <li>
                <LocaleSwitcher />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default MenuMobile;
