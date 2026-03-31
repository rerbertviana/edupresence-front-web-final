"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full h-10 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
          "placeholder:text-gray-400",
          "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-gray-200",
          className,
        )}
      />
    );
  },
);

TextInput.displayName = "TextInput";
