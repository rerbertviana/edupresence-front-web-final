import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx("card", className)}>{children}</div>;
}

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: SectionProps) {
  return (
    <div
      className={clsx(
        "mb-3 flex items-center justify-between gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: SectionProps) {
  return (
    <h2 className={clsx("text-sm font-semibold text-slate-900", className)}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className }: SectionProps) {
  return (
    <div className={clsx("text-sm text-slate-700", className)}>{children}</div>
  );
}
