import React, { startTransition } from 'react'
import { Button } from '../button/button';

const ButtonSearch = ({onClick, btnText}:{onClick?:()=>void, btnText?:string}) => {
  return (
    <Button className="h-full pt-2 pb-2 pr-6 pl-6 bg-white text-background" onClick={onClick}>{btnText}</Button>
  )
}

export default ButtonSearch