"use client";

import { Bell, UserCircle2 } from "lucide-react";

type DashboardHeaderProps = {
  displayName: string;
  displayRole: string;

  isTeacher: boolean;
  pendingCount: number;
  animateBell: boolean;

  onOpenSidebar: () => void;
  onOpenPending: () => void;
};

export function DashboardHeader({
  displayName,
  displayRole,
  isTeacher,
  pendingCount,
  animateBell,
  onOpenSidebar,
  onOpenPending,
}: DashboardHeaderProps) {
  return (
    <header className="w-full shrink-0">
      <div
        className={`
          flex items-center justify-between gap-2
          min-h-[78px] md:min-h-[90px]
          px-3 md:px-4 py-3
          rounded-lg
          bg-slate-950/90 backdrop-blur-md
          border-2 border-white
          shadow-xl
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className={`
              md:hidden shrink-0
              h-10 w-10 rounded-xl
              bg-slate-900/70 hover:bg-slate-800/70
              border border-slate-800/70
              transition-colors
              flex items-center justify-center
            `}
            aria-label="Abrir menu"
            title="Abrir menu"
          >
            <span className="text-slate-100 text-base leading-none">☰</span>
          </button>

          <div className="min-w-0">
            <p className="text-[11px] md:text-xs text-slate-400 leading-tight">
              Bem-vindo ao painel
            </p>

            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-slate-50 leading-tight truncate">
                EduPresence
              </h1>

              <span className="hidden sm:inline-flex h-5 px-2 rounded-full text-[10px] font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
                IFBA
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {isTeacher && (
            <button
              onClick={onOpenPending}
              className={`
                relative shrink-0
                h-10 w-10 md:h-11 md:w-11
                rounded-lg
                bg-slate-900/60 hover:bg-slate-800/60
                border border-slate-800/70
                transition-colors
                flex items-center justify-center
              `}
              aria-label="Abrir solicitações"
              title="Abrir solicitações"
            >
              <Bell
                className={`h-5 w-5 md:h-6 md:w-6 text-slate-100 ${
                  animateBell ? "animate-bellShake" : ""
                }`}
              />

              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] rounded-full bg-emerald-500 px-1.5 flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-slate-950 leading-none">
                    {pendingCount}
                  </span>
                </span>
              )}
            </button>
          )}

          <div
            className={`
              flex items-center gap-2
              h-11 md:h-12
              px-3 md:px-4
              rounded-lg
              bg-slate-900/55
              border border-slate-800/70
              min-w-0
              max-w-[52vw] sm:max-w-[58vw] md:max-w-[360px]
            `}
            title={displayName}
          >
            <div
              className={`
                shrink-0 h-8 w-8 rounded-lg
                bg-emerald-500/10 border border-emerald-500/20
                flex items-center justify-center
              `}
            >
              <UserCircle2 className="h-5 w-5 text-emerald-100" />
            </div>

            <div className="min-w-0 leading-tight">
              <p className="font-semibold text-slate-50 text-xs md:text-sm truncate">
                {displayName}
              </p>
              <p className="text-[10px] md:text-[11px] text-slate-400 truncate">
                {displayRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
