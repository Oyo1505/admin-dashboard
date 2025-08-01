'use client'
import { NavItem } from '@/domains/layout/components/menu-dashboard-nav-item/menu-dashboard-nav-item'
import { AddIncon, Favorite, Home, SettingsIcon, UsersIcon } from '@/domains/ui/components/icons/icons'
import { URL_DASHBOARD, URL_DASHBOARD_MOVIE, URL_DIRECTOR_SECTION, URL_FAVORITE, URL_GENRE_SECTION, URL_SETTINGS, URL_SUGGESTION, URL_USERS } from '@/shared/route'
import checkPermissions from '@/shared/utils/permissions/checkPermissons'
import { useTranslations } from 'next-intl'
import useUserStore from 'store/user/user-store'

const MenuDashboard = () => {
  const { user } = useUserStore(state => state)
  const t = useTranslations('DashboardNav');
  const hasPermission = checkPermissions(user, "can:delete", "user") && checkPermissions(user, "can:delete", "movie");
  return (
    <div className="flex-1 bg-primary  overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavItem href={URL_DASHBOARD}>
            <Home />
              {t('dashboard')}
            </NavItem>
            <NavItem href={URL_SUGGESTION}>
              <AddIncon />
                   {t('suggestion')}
              </NavItem>
            {user && hasPermission &&<>
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
