"use client"
import useAuthStatus from '@/components/auth/hooks/auth-status'
import useUserStore from '@/store/user/user-store'
import React, { ReactElement } from 'react'

const LayoutLogic =  ({children}: { children? : ReactElement}) => {
  useAuthStatus()
  return (
    <>{children}</>
  )
}

export default LayoutLogic