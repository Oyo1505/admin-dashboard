'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

export function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 rounded-lg  px-3 py-2 text-background  transition-all hover:text-gray-600',
        {
          'bg-background text-primary': segment ? href.includes(segment) : null,
        }
      )}
    >
      {children}
    </Link>
  );
}
