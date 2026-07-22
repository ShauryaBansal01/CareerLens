import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-900 text-white hover:bg-primary-900/80 dark:bg-primary-800 dark:hover:bg-primary-800/80",
        secondary:
          "border-transparent bg-slate-100 text-text-main hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-600/80",
        success:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        error:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80",
        primary:
          "border-transparent bg-accent-700 text-white hover:bg-accent-700/80",
        outline: "text-text-main border-border-color",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.memo(function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
})

export { Badge, badgeVariants }
