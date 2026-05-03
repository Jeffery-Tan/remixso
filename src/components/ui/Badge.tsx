import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning";
  children: ReactNode;
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
          outline: "border border-[var(--outline-variant)] text-[var(--foreground)]",
          success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
