import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:-translate-y-px",
          {
            primary:
              "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)]",
            secondary:
              "bg-[var(--surface-container)] text-[var(--foreground)] hover:bg-[var(--surface-container-high)]",
            outline:
              "border border-[var(--outline-variant)] bg-transparent hover:bg-[var(--surface-container-low)] text-[var(--foreground)]",
            ghost:
              "bg-transparent hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]",
          }[variant],
          {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
          }[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
