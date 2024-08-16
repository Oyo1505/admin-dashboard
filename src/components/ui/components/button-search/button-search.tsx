import React, { startTransition } from 'react'
import { Button } from '../button/button';
import clsx from 'clsx';

const ButtonSearch = ({onClick, btnText, className }:{onClick: React.MouseEventHandler<HTMLButtonElement>, btnText: string, className?: string}) => {
  return (
    <Button className={clsx(className,"h-full pt-3 pb-3 pr-6 pl-6 bg-white text-background")}
    
    onClick={onClick}>{btnText}</Button>
  )
}

export default ButtonSearch