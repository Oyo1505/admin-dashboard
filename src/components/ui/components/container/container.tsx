import { cn } from '@/lib/utils'
import React, { ReactElement } from 'react'

interface Props {
  className? : string
  children: ReactElement
}

const Container = ({className, children}: Props) => {
  return (
    <div className={cn('container w-full md:px-20', className)}>{children}</div>
  )
}

export default Container