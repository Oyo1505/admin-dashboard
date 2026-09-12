'use client';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuHeaderItem = ({
  pathname,
  translation,
}: {
  pathname: string;
  translation: string;
}) => {
  const currentPathname = usePathname();
  const t = useTranslations('Menu');
  const isActive =
    currentPathname === pathname || currentPathname?.startsWith(`${pathname}/`);

  return (
    <Link
      className={cn(
        'hover:text-red-500 text-primary transition-colors duration-300',
        isActive ? 'text-red-500' : ''
      )}
      prefetch
      href={pathname}
    >
      {t(translation)}
    </Link>
  );
};

export default MenuHeaderItem;
