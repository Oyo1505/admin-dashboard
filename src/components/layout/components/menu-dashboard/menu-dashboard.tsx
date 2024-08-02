'use client'
import { NavItem } from '@/app/nav-item'
import { SettingsIcon, UsersIcon } from '@/components/ui/components/icons/icons'
import { URL_FAVORITE, URL_SETTINGS } from '@/shared/route'
import React from 'react'
import useUserStore from 'store/user/user-store'

const MenuDashboard = () => {
  const { user } = useUserStore(state => state)

  return (
    <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {user && user?.role === 'ADMIN' &&
                  <NavItem href="/">
                  <UsersIcon className="h-4 w-4" />
                  Users
                </NavItem>
            }
          <NavItem href={URL_FAVORITE}>
                  Favorite
            </NavItem>
            <NavItem href={URL_SETTINGS}>
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavItem>
          </nav>
        </div>
  )
}

export default MenuDashboard