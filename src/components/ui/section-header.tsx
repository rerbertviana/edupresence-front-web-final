"use client";

import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  highlightColor?: string;
  className?: string;
  arrow?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  highlightColor = "#00923F",
  className,
  arrow = false,
}: SectionHeaderProps) {
  let left = title;
  let right = "";

  if (arrow && title.includes(" ")) {
    const parts = title.split(" ");
    left = parts[0];
    right = parts.slice(1).join(" ");
  }

  return (
    <div className={`relative flex flex-col pb-4 ${className ?? ""}`}>
      <h2
        className="w-full flex items-center justify-center gap-2 text-center text-xl font-semibold text-slate-50 mb-4 p-3 rounded-md"
        style={{ backgroundColor: highlightColor }}
      >
        {arrow ? (
          <div className="flex items-center">
            <span>{left}</span>
            <ArrowRight className="h-5 w-5 ml-2 mr-2 mt-1" />
            <span>{right}</span>
          </div>
        ) : (
          title
        )}
      </h2>

      {subtitle && (
        <p className="text-sm text-slate-400 text-center mb-2">{subtitle}</p>
      )}

      <div className="w-full mt-4 h-[4px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </div>
  );
}
