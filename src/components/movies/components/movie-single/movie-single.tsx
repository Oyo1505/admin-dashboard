import React, { FC } from 'react'

interface IMovie{
  movie : any
}

const MovieSingle: FC<IMovie> = ({movie}) => {
  return (
    <div>{movie?.title}</div>
  )
}

export default MovieSingle