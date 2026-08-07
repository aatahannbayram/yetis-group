import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Shared ink (black) CTA — hover lifts, active presses. Use on Link/raw buttons too. */
export const btnInkClassName =
  "bg-[var(--neutral-900)] text-[var(--neutral-50)] " +
  "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.18),0_4px_12px_-2px_rgb(0_0_0/0.35)] " +
  "transition-[transform,box-shadow,background-color] duration-150 ease-out " +
  "hover:-translate-y-0.5 hover:bg-[var(--neutral-800)] " +
  "hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2),0_4px_10px_rgb(0_0_0/0.22),0_14px_28px_-8px_rgb(0_0_0/0.5)] " +
  "active:translate-y-0.5 active:bg-[var(--neutral-950,#0a0a0a)] " +
  "active:shadow-[inset_0_3px_8px_0_rgb(0_0_0/0.5),0_1px_1px_rgb(0_0_0/0.12)] " +
  "dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.55),0_1px_2px_rgb(0_0_0/0.35),0_4px_12px_-2px_rgb(0_0_0/0.45)] " +
  "dark:hover:bg-white dark:hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.7),0_4px_10px_rgb(0_0_0/0.35),0_14px_28px_-8px_rgb(0_0_0/0.55)] " +
  "dark:active:bg-zinc-200 dark:active:shadow-[inset_0_3px_8px_0_rgb(0_0_0/0.25),0_1px_1px_rgb(0_0_0/0.2)]"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: btnInkClassName,
        outline:
          "border-border bg-background transition-[background-color,color,box-shadow] duration-150 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground transition-[background-color,color] duration-150 hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive transition-[background-color] duration-150 hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 transition-colors hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
