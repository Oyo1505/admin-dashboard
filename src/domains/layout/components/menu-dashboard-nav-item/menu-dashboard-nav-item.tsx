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
  const isCurrentPage = segment ? href.includes(segment) : false;

  return (
    <Link
      href={href}
      aria-current={isCurrentPage ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors hover:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        {
          'bg-neutral-500 text-white': isCurrentPage,
        }
      )}
    >
      {children}
    </Link>
  );
}
