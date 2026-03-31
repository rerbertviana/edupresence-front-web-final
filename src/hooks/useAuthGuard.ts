"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const AUTH_STORAGE_KEY = "edupresence_auth";
const LOGOUT_FLAG_KEY = "edupresence_logging_out";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggingOut = window.localStorage.getItem(LOGOUT_FLAG_KEY) === "1";
    if (isLoggingOut) {
      setChecked(false);
      router.replace("/login");
      return;
    }

    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!isAuthenticated && !stored) {
      setChecked(false);
      router.replace("/login");
      return;
    }

    if (stored && !user) {
      setChecked(false);
      return;
    }

    const role = user?.role ?? "";
    const isAdmin = role === "ADMIN";
    const isTeacher = role === "TEACHER";

    if (pathname === "/dashboard") {
      setChecked(true);
      return;
    }

    if (
      pathname.startsWith("/dashboard/attendances") ||
      pathname.startsWith("/dashboard/lessons")
    ) {
      if (!isTeacher) {
        setChecked(false);
        router.replace("/dashboard");
        return;
      }
      setChecked(true);
      return;
    }

    if (pathname.startsWith("/dashboard")) {
      if (!isAdmin) {
        setChecked(false);
        router.replace("/dashboard");
        return;
      }
      setChecked(true);
      return;
    }

    setChecked(true);
  }, [isAuthenticated, user, pathname, router]);

  return { checked };
}
