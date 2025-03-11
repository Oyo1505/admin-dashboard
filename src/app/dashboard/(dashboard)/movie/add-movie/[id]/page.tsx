import { PageProps } from '.next/types/app/page';
import FormMovie from '@/domains/dashboard/components/form-movie/form-movie';

import React from 'react'

const Page = async (props:PageProps) => {
  const {id} = await props.params;

  return (
    <FormMovie idFromGoogleDrive={id} />
  )
}

export default Page