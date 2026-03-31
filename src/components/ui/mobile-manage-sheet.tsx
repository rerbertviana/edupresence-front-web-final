"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MobileManageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function MobileManageSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: MobileManageSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-4 py-3 border-b border-gray-100">
          <SheetTitle className="text-sm font-semibold text-gray-800">
            {title}
          </SheetTitle>
          <SheetDescription className="text-xs text-gray-500">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
