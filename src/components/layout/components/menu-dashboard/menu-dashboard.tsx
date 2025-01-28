'use client'
import { NavItem } from '@/components/layout/components/menu-dashboard-nav-item/menu-dashboard-nav-item'
import { AddIncon, Favorite, Home, SettingsIcon, UsersIcon } from '@/components/ui/components/icons/icons'
import { URL_DASHBOARD, URL_DIRECTOR_SECTION, URL_FAVORITE, URL_DASHBOARD_MOVIE,URL_GENRE_SECTION, URL_SETTINGS, URL_USERS } from '@/shared/route'
import { useTranslations } from 'next-intl'
import React from 'react'
import useUserStore from 'store/user/user-store'

const MenuDashboard = () => {
  const { user } = useUserStore(state => state)
  const t = useTranslations('DashboardNav');

  return (
    <div className="flex-1 bg-primary  overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavItem href={URL_DASHBOARD}>
            <Home />
              {t('dashboard')}
            </NavItem>
            {user && user?.role === 'ADMIN' &&<>
               <NavItem href={URL_USERS}>
                  <UsersIcon className="h-4 w-4" />
                    {t('users')}
              </NavItem>
               <NavItem href={URL_DASHBOARD_MOVIE}>
              <AddIncon />
                {t('movies')}
              </NavItem>
              <NavItem href={URL_DIRECTOR_SECTION}>
              <AddIncon />
                    {t('director')}
              </NavItem>
              <NavItem href={URL_GENRE_SECTION}>
              <AddIncon />
                   {t('genre')}
              </NavItem>
           </>
            }
          <NavItem href={URL_FAVORITE}>
           <Favorite />
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