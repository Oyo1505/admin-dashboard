'use client'
import React from 'react'
import ReactPlayer from 'react-player'

const VideoPlayerYoutube = ({movie}:{movie:string}) => {
  return (<ReactPlayer className='mt-6  h-28 lg:w-72 lg:h-72' url={movie} controls={true} width='100%' height='100%' />)
}

export default VideoPlayerYoutube