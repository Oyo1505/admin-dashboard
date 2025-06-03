import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner'

const Loading = () => {
  return (
    <div className='flex w-full h-screen justify-center items-center'>
      <LoadingSpinner />
    </div>
  )
}

export default Loading
