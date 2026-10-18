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
  const isActive = segment ? href.includes(segment) : false;

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors hover:text-gray-400',
        {
          'bg-neutral-500 text-white': segment ? href.includes(segment) : null,
        }
      )}
    >
      {children}
    </Link>
  );
}
