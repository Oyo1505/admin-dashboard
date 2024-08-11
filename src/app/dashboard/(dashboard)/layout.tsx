import MenuDashboard from "@/components/layout/components/menu-dashboard/menu-dashboard";
import LoadingSpinner from "@/components/shared/loading-spinner/loading-spinner";
import { Suspense } from "react";

export const metadata = {
  title: 'Dashboard',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) { 
  return (
    <Suspense fallback={<LoadingSpinner />}>
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <MenuDashboard />
      </div>
    </div>
    <div className="flex flex-col">
      {children}
    </div>
  </div>
  </Suspense>
  );
}
