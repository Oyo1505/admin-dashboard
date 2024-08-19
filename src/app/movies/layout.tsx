import Container from '@/components/ui/components/container/container';
import React, { ReactElement } from 'react'

const Layout = ({
  children
}: {
  children: ReactElement;
}) => {
  return (
    <Container className='pt-14'>
    {children}
  </Container>
  )
}

export default Layout