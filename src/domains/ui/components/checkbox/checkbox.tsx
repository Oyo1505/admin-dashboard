import { cn } from '@/lib/utils';
import * as React from 'react';

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <>
      <input type="checkbox" className={cn(className)} ref={ref} {...props} />
    </>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
