
import { cn } from "@/lib/utils"
import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <>
      <input
        type='checkbox'
        className={cn(
          className, 
        )}
        ref={ref}
        {...props}
      />
      </>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
