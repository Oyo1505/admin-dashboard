'use client'
import React from 'react'
import ReactPlayer from 'react-player'

const VideoPlayerYoutube = ({movie}:{movie:string}) => {
  return (<ReactPlayer className='mt-6' url={movie} controls width='250px' height='400' />)
}

export default VideoPlayerYoutube