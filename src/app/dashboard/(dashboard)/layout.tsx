import MenuDashboard from "@/domains/layout/components/menu-dashboard/menu-dashboard";
import LoadingSpinner from "@/domains/shared/loading-spinner/loading-spinner";
import Container from "@/domains/ui/components/container/container";
import { auth } from '@/lib/auth';
import { URL_BASE } from "@/shared/route";
import { redirect } from 'next/navigation';
import { Suspense } from "react";

export const metadata = {
  title: 'Dashboard',
};

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  if(!session?.user) return redirect(URL_BASE)
  return (
    <Container className="pt-18" marginSide={false}>
      <Suspense fallback={<LoadingSpinner />}>
      <div className="grid md:min-h-screen h-full w-full lg:grid-cols-[280px_1fr] ">
      <div className="border-r h-52 md:h-full bg-primary lg:block ">
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
