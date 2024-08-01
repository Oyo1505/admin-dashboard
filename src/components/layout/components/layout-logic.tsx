"use client"
import React, { ReactElement } from 'react'
import useAuthStatus from '../../auth/hooks/auth-status'

const LayoutLogic =  ({children}: { children? : ReactElement}) => {
  useAuthStatus()
  return (
    <>{children}</>
  )
}

export default LayoutLogic