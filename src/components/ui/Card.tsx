import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)] p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
