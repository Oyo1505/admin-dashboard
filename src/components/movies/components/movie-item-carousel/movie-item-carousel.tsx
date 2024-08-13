import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const MovieItemCarousel = ({image, title, id }: {image: string, title: string, id: string}) => {
  return (
    <Link href={`/movies/${id}`} >
    <div className='group flex mr-4 relative w-64 rounded-lg  flex-col justify-between h-full'>
        <div className='w-full rounded-lg h-full relative overflow-hidden'>
          <div className='relative w-full h-full'>
            <Image
              priority
              src={image}
              alt={title}
              className='w-full h-full rounded-lg transform transition-transform duration-300 group-hover:scale-110'
              width={300}
              height={200}
            />
          </div>
          <div className='absolute inset-0 rounded-lg group-hover:bg-black group-hover:bg-opacity-50'></div>
        </div>
      <div className='absolute pr-2 pl-2 inset-0 flex text-center items-center  justify-center text-lg font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity'>{title}</div>
    </div>
    </Link>
  )
}

export default MovieItemCarousel 