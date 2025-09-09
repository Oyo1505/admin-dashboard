import clsx from 'clsx';
import React, { memo } from 'react';
import { Button } from '../button/button';

const ButtonSearch = memo(
  ({
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
        className={clsx(
          className,
          'h-full pt-3 pb-3 pr-6 pl-6 bg-white text-background'
        )}
        onClick={onClick}
      >
        {btnText}
      </Button>
    );
  }
);
ButtonSearch.displayName = 'ButtonSearch';
export default ButtonSearch;
