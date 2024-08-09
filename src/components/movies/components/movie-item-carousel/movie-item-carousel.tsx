import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const MovieItemCarousel = ({image, title, id }: {image: string, title: string, id: string}) => {
  return (
    <Link href={`/movies/${id}`}>
    <div className='group  flex relative w-52 flex-col justify-between h-full'>
    <div className='relative w-full h-full'>
      <Image src={image} alt={title} className='w-full h-full' width={300} height={200} />
      <div className='absolute inset-0 group-hover:bg-black group-hover:bg-opacity-50'></div>
    </div>
      <div className='absolute pr-2 pl-2 inset-0 flex text-center items-center justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity'>{title}</div>
    </div>
    </Link>
  )
}

export default MovieItemCarousel 