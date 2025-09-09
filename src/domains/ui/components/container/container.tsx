import { cn } from '@/lib/utils';
import { ReactNode, memo } from 'react';

interface Props {
  className?: string;
  children: ReactNode;
  marginSide?: boolean;
}

const Container = memo(({ className, children, marginSide = true }: Props) => {
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
});
Container.displayName = 'Container';
export default Container;
