import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent-700 text-white hover:bg-accent-800 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-border-color bg-bg-card hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main shadow-sm",
        secondary: "bg-slate-100 dark:bg-slate-800 text-text-main hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main",
        link: "text-accent-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.memo(React.forwardRef(({ className, variant, size, icon: Icon, isLoading, children, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  )
}))
Button.displayName = "Button"

export { Button, buttonVariants }
