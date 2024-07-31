'use client'
import React, { ReactElement } from 'react'
import { Button } from '../../button'
import useUserStore from '@/store/user/user-store'

const ButtonLogout = ({children}: {children: ReactElement}) => {
  const { removeUser } = useUserStore((state: any) => state)
  const onClick = async () => {
    removeUser()
  }
  return (
    <Button onClick={onClick}>{children}</Button>
  )
}

export default ButtonLogout