import clsx from 'clsx';
import React from 'react';
import { Button } from '../button/button';

const ButtonSearch = ({
  onClick,
  btnText,
  className,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  btnText: string;
  className?: string;
}) => {
  return (
    <Button
      className={clsx(className, 'h-full pt-3 pb-3 pr-6 pl-6 ')}
      onClick={onClick}
    >
      {btnText}
    </Button>
  );
};

export default ButtonSearch;
