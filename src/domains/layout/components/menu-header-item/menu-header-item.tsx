'use client';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { memo } from 'react';

const MenuHeaderItem = memo(
  ({ pathname, translation }: { pathname: string; translation: string }) => {
    const segment = useSelectedLayoutSegment();
    const t = useTranslations('Menu');
    return (
      <Link
        className={cn(
          'hover:text-red-500 text-primary transition-all duration-300',
          {
            'text-red-500': segment ? pathname?.includes(segment) : null,
          }
        )}
        prefetch
        href={pathname}
      >
        {t(translation)}
      </Link>
    );
  }
);
MenuHeaderItem.displayName = 'MenuHeaderItem';
export default MenuHeaderItem;
