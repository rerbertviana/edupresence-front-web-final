"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col w-full min-w-[150px]", className)}>
      <label
        htmlFor={id}
        className="text-xs mb-2 font-semibold uppercase tracking-wide text-slate-300"
      >
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  );
}
