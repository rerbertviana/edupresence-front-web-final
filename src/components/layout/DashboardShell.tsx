"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { roleLabel } from "@/helpers/roleLabel";

import { usePendingAttendances } from "@/hooks/usePendingAttendances";
import { PendingAttendancesPanel } from "@/components/layout/pending-attendances/PendingAttendancesPanel";

import { DashboardContentSkeleton } from "@/components/layout/DashboardContentSkeleton";

type DashboardShellProps = {
  children: ReactNode;
  autoFocusMain?: boolean;
};

export function DashboardShell({
  children,
  autoFocusMain = true,
}: DashboardShellProps) {
  const { checked } = useAuthGuard();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);

  const isPageNavigating = !!pendingRoute && pendingRoute !== pathname;

  useEffect(() => {
    if (pendingRoute === pathname) setPendingRoute(null);
  }, [pathname, pendingRoute]);

  useEffect(() => {
    if (!autoFocusMain) return;

    const frame = window.requestAnimationFrame(() => {
      mainRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, autoFocusMain]);

  const isTeacher = user?.role === "TEACHER";

  const displayName = useMemo(() => {
    const name = user?.fullName?.trim();
    return name && name.length > 0 ? name : "Usuário logado";
  }, [user?.fullName]);

  const displayRole = useMemo(() => {
    return `Perfil: ${roleLabel(user?.role)}`;
  }, [user?.role]);

  const { pendingAttendances, pendingCount, animateBell } =
    usePendingAttendances({
      enabled: checked && !!user && isTeacher,
    });

  const showSkeleton = !checked || isPageNavigating;

  const handleNavigateStart = (_href: string) => {
    setPendingRoute(_href);
    setIsSidebarOpen(false);
  };

  const handleSkipToContent = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      mainRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden overflow-x-hidden p-2 box-border">
      <a
        href="#main-content"
        onKeyDown={handleSkipToContent}
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:left-4
          focus:top-4
          focus:z-[999]
          focus:rounded-md
          focus:bg-white
          focus:px-4
          focus:py-2
          focus:text-sm
          focus:font-semibold
          focus:text-gray-900
          focus:shadow-lg
        "
      >
        Pular para o conteúdo principal
      </a>

      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg/login-bg.png')" }}
        />
      </div>

      <div className="relative flex h-full w-full min-w-0 min-h-0">
        <div
          className="hidden md:block shrink-0"
          aria-label="Navegação lateral"
        >
          <Sidebar onNavigateStart={handleNavigateStart} />
        </div>

        {isSidebarOpen && (
          <>
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 md:hidden bg-slate-950/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            <div
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu lateral"
            >
              <aside className="h-full w-64 rounded-r-2xl border border-slate-800/70 bg-slate-950/70 backdrop-blur-md shadow-2xl">
                <Sidebar onNavigateStart={handleNavigateStart} />
              </aside>
            </div>
          </>
        )}

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <DashboardHeader
            displayName={displayName}
            displayRole={displayRole}
            isTeacher={isTeacher}
            pendingCount={pendingCount}
            animateBell={animateBell}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenPending={() => setPendingOpen(true)}
          />

          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            role="main"
            aria-label="Conteúdo principal"
            className="app-content relative flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pt-2 outline-none focus:outline-none"
          >
            {showSkeleton ? <DashboardContentSkeleton /> : children}
          </main>
        </div>
      </div>

      {checked && isTeacher && (
        <PendingAttendancesPanel
          open={pendingOpen}
          onOpenChange={setPendingOpen}
          pendingAttendances={pendingAttendances}
        />
      )}
    </div>
  );
}
