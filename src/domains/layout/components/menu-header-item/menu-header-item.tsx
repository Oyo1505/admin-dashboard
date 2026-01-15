'use client';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

const MenuHeaderItem = ({
  pathname,
  translation,
}: {
  pathname: string;
  translation: string;
}) => {
  const segment = useSelectedLayoutSegment();
  const t = useTranslations('Menu');
  return (
    <Link
      className={cn(
        'hover:text-red-500 text-primary transition-colors duration-300',
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
};

export default MenuHeaderItem;
