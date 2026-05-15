import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface placeholder:text-outline outline-none transition-shadow",
        "focus-visible:ring-2 focus-visible:ring-action/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
