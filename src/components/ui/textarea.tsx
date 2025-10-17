import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-white/20 bg-white/10 backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-accent/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-xl border px-3 py-2 text-base shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
