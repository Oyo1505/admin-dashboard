import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface Props {
  className? : string
  children: ReactNode
}

const Container = ({className, children}: Props) => {
  return (
    <div className={cn('container md:px-20', className)}>{children}</div>
  )
}

export default Container