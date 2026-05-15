"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-action text-white shadow-lg hover:bg-action/90 active:scale-[0.98]",
        secondary:
          "bg-surface-border text-white hover:bg-surface-container-highest border border-white/10",
        ghost:
          "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5",
        primarySoft:
          "bg-primary text-on-primary shadow-lg hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        sm: "h-9 px-4 text-xs",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {props.children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
