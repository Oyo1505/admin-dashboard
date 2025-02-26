import Container from '@/components/ui/components/container/container';
import { ReactElement, Suspense } from 'react';
import Loading from './loading';

const Layout =  ({
  children
}: {
  children: ReactElement;
}) => {
  return (
    <Suspense fallback={<Loading />} >
      <Container className='pt-14'>
        {children}
      </Container>
    </Suspense>
  )
}

export default Layout