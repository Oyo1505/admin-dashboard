import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner'
import React from 'react'

const Loading = () => {
  return (
    <div className='flex w-full h-full justify-center items-center'>
      <LoadingSpinner />
    </div>
  )
}

export default Loading