import { getAllMovies } from '@/components/dashboard/action'
import React from 'react'

const Page =  async() => {
  const movies = await getAllMovies()
  return (
    <div className='flex flex-col mt-6 gap-4 md:gap-8'>
      <div>Derniers Ajouts</div>
      <div>Un Pays</div>
      <div>Coups de cœur</div>
      <div>Mon Top 10</div>
    </div>
  )
}

export default Page