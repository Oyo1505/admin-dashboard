import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface Props {
  className? : string
  children: ReactNode
  marginSide?: boolean
}

const Container = ({className, children, marginSide=true}: Props) => {
  return (
    <div className={cn(marginSide ? 'mr-12 ml-12' : null, 'container-center  pr-3 pl-3', className)}>{children}</div>
  )
}

export default Container