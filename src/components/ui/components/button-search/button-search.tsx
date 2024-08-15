import React, { startTransition } from 'react'
import { Button } from '../button/button';

const ButtonSearch = ({onClick}:{onClick?:()=>void}) => {
  return (
    <Button className="absolute right-2 top-1 h-8 w-23 bg-white text-background" onClick={onClick}>ButtonSearch</Button>
  )
}

export default ButtonSearch