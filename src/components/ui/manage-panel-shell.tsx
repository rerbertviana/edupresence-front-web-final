"use client";

import * as React from "react";
import { CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type ManagePanelShellProps = {
  compact?: boolean;
  title: string;
  icon: React.ReactNode;
  subtitle?: React.ReactNode;
  showNewButton?: boolean;
  onNewClick?: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
  rootClassName?: string;
};

export function ManagePanelShell({
  compact,
  title,
  icon,
  subtitle,
  showNewButton,
  onNewClick,
  children,
  bodyClassName,
  rootClassName,
}: ManagePanelShellProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col",
        compact ? "border-0 shadow-none rounded-none" : "shrink-0",
        rootClassName,
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          </div>
          {subtitle ? (
            <p className="text-[11px] text-gray-500 truncate mt-1">{subtitle}</p>
          ) : null}
        </div>

        {showNewButton ? (
          <button
            type="button"
            onClick={onNewClick}
            className="h-8 px-3 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 whitespace-nowrap"
          >
            <CirclePlus className="h-4 w-4 inline mr-2" />
            Novo
          </button>
        ) : null}
      </div>

      <div className={cn("p-4", compact && "pb-28", bodyClassName)}>{children}</div>
    </div>
  );
}
