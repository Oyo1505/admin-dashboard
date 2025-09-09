import { cn } from '@/lib/utils';
import { forwardRef, memo } from 'react';

const Checkbox = memo(
  forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
      return (
        <>
          <input
            type="checkbox"
            className={cn(className)}
            ref={ref}
            {...props}
          />
        </>
      );
    }
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
