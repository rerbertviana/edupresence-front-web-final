"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function SelectNative({
  value,
  onChange,
  disabled,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  options: Option[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full h-10 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
        "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "border-gray-200",
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
