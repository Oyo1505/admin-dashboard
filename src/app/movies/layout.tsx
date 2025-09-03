import Container from '@/domains/ui/components/container/container';
import { ReactNode, Suspense } from 'react';
import Loading from './loading';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<Loading />}>
      <Container className="pt-14">{children}</Container>
    </Suspense>
  );
};

export default Layout;
