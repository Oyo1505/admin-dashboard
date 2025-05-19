'use client'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
const MenuHeaderItem = ({pathname, translation}: {pathname: string, translation: string}) => {
  const segment = useSelectedLayoutSegment()
  const t = useTranslations('Menu')
  return (
    <Link className={cn('hover:text-red-600 text-primary transition-all duration-300', {
      'text-red-600':segment ? pathname?.includes(segment) : null
    })} prefetch href={pathname}>{t(translation)}</Link>
  )
}

export default MenuHeaderItem