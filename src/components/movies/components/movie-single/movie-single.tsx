import React, { FC } from 'react'

interface IMovie{
  movie : any
}

const MovieSingle: FC<IMovie> = ({movie}) => {
  return (
    <div>MovieSingle</div>
  )
}

export default MovieSingle