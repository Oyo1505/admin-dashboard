import MenuDashboard from '@/domains/layout/components/menu-dashboard/menu-dashboard';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import Container from '@/domains/ui/components/container/container';
import { auth } from '@/lib/auth';
import { URL_BASE } from '@/shared/route';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return redirect(URL_BASE);
  return (
    <Container className="pt-18" marginSide={false}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid  w-full lg:grid-cols-[280px_1fr] ">
          <div className=" h-52 lg:h-[calc(100vh-10rem)]  lg:block rounded-md">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <MenuDashboard />
            </div>
          </div>
          {children}
        </div>
      </Suspense>
    </Container>
  );
}
