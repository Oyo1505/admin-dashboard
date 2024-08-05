'use client'
import { NavItem } from '@/app/nav-item'
import { SettingsIcon, UsersIcon } from '@/components/ui/components/icons/icons'
import { URL_ADD_MOVIE, URL_DASHBOARD, URL_FAVORITE, URL_SETTINGS, URL_USERS } from '@/shared/route'
import { useTranslations } from 'next-intl'
import React from 'react'
import useUserStore from 'store/user/user-store'

const MenuDashboard = () => {
  const { user } = useUserStore(state => state)
  const t = useTranslations('DashboardNav');

  return (
    <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavItem href={URL_DASHBOARD}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
              {t('dashboard')}
            </NavItem>
            {user && user?.role === 'ADMIN' &&<>
               <NavItem href={URL_USERS}>
                  <UsersIcon className="h-4 w-4" />
                    {t('users')}
              </NavItem>
               <NavItem href={URL_ADD_MOVIE}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
                {t('add-movie')}
              </NavItem>
           </>
            }
          <NavItem href={URL_FAVORITE}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            {t('favorite')}
            </NavItem>
            <NavItem href={URL_SETTINGS}>
              <SettingsIcon className="h-4 w-4" />
              {t('settings')}
            </NavItem>
          </nav>
        </div>
  )
}

export default MenuDashboard