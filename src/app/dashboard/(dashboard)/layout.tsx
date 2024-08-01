import { NavItem } from "@/app/nav-item";
import {SettingsIcon, UsersIcon } from "@/components/ui/components/icons/icons";

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
     
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavItem href="/">
              <UsersIcon className="h-4 w-4" />
              Users
            </NavItem>
            <NavItem href="/settings">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavItem>
          </nav>
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      {children}
    </div>
  </div>

  );
}
