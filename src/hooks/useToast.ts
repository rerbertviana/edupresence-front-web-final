"use client";

import { useRef, useState } from "react";
import type { ToastState } from "@/components/ui/toast";

type UseToastReturn = {
  toast: ToastState | null;
  showToast: (type: ToastState["type"], message: string) => void;
  closeToast: () => void;
  setToast: React.Dispatch<React.SetStateAction<ToastState | null>>;
};

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastIdRef = useRef(1);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ id: toastIdRef.current++, type, message });
  }

  function closeToast() {
    setToast(null);
  }

  return { toast, showToast, closeToast, setToast };
}
