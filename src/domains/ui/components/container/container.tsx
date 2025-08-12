import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props {
  className?: string;
  children: ReactNode;
  marginSide?: boolean;
}

const Container = ({ className, children, marginSide = true }: Props) => {
  return (
    <div
      className={cn(
        marginSide ? 'mr-12 ml-12' : null,
        'pr-3 pl-3 container mx-auto flex flex-col justify-center',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
