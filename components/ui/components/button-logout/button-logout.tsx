'use client'
import React from 'react'
import { Button } from '../../button'
import { signOut } from 'next-auth/react'
import useUserStore from '@/store/user/user-store'

const ButtonLogout = () => {
  const { removeUser } = useUserStore((state: any) => state)
  const onClick = async () => {
    removeUser()
    await signOut();
  }
  return (
    <Button onClick={onClick}>ButtonLogout</Button>
  )
}

export default ButtonLogout