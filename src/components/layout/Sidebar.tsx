"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  LayoutDashboard,
  Layers,
  Users,
  CalendarDays,
  BookOpen,
  GraduationCap,
  FilePen,
  IdCard,
  Presentation,
  CheckCircle,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigateStart?: (href: string) => void;
}

const LOGOUT_FLAG_KEY = "edupresence_logging_out";

export function Sidebar({ onNavigateStart }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const lastRoleRef = useRef<string>("");

  useEffect(() => {
    const role = user?.role?.trim();
    if (!isLoggingOut && role) lastRoleRef.current = role;
  }, [user?.role, isLoggingOut]);

  const effectiveRole = isLoggingOut ? lastRoleRef.current : (user?.role ?? "");

  useEffect(() => {
    if (pendingRoute === pathname) setPendingRoute(null);
  }, [pathname, pendingRoute]);

  const handleNavStart = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      const isPrimaryClick = event.button === 0;
      const isModifiedClick =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const isSameTab =
        !event.currentTarget.target || event.currentTarget.target === "_self";

      if (
        !event.defaultPrevented &&
        isPrimaryClick &&
        !isModifiedClick &&
        isSameTab
      ) {
        onNavigateStart?.(href);
      }
    },
    [onNavigateStart],
  );

  const adminItems = useMemo(
    () => [
      { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
      { href: "/dashboard/courses", label: "CURSOS", icon: GraduationCap },
      { href: "/dashboard/subjects", label: "DISCIPLINAS", icon: BookOpen },
      { href: "/dashboard/classes", label: "SEMESTRES", icon: Layers },
      { href: "/dashboard/students", label: "ESTUDANTES", icon: Users },
      { href: "/dashboard/teachers", label: "PROFESSORES", icon: FilePen },
      {
        href: "/dashboard/class-subjects",
        label: "TURMAS",
        icon: Presentation,
      },
      { href: "/dashboard/enrollments", label: "MATRÍCULAS", icon: IdCard },
    ],
    [],
  );

  const teacherItems = useMemo(
    () => [
      { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
      { href: "/dashboard/lessons", label: "AULAS", icon: CalendarDays },
      {
        href: "/dashboard/attendances",
        label: "FREQUÊNCIAS",
        icon: CheckCircle,
      },
    ],
    [],
  );

  const isAdmin = effectiveRole === "ADMIN";
  const navItems = isAdmin ? adminItems : teacherItems;

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === pathname || isLoggingOut) return;

    handleNavStart(event, href);
    event.preventDefault();

    setPendingRoute(href);

    startTransition(() => {
      router.push(href);
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    lastRoleRef.current = user?.role ?? lastRoleRef.current;

    try {
      window.localStorage.setItem(LOGOUT_FLAG_KEY, "1");
    } catch {}

    setIsLoggingOut(true);

    try {
      await Promise.resolve(logout());
    } finally {
      router.replace("/login");
    }
  };

  return (
    <aside className="sidebar flex flex-col" aria-label="Barra lateral">
      <div>
        <div className="sidebar-header">
          <div
            className="relative h-9 w-9 rounded-md bg-[#00923F] flex items-center justify-center shadow-lg shadow-emerald-900/60"
            aria-hidden="true"
          >
            <span className="text-[10px] font-semibold tracking-tight text-white">
              IF
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              IFBA · EduPresence
            </p>
            <p className="text-[11px] text-slate-400 whitespace-nowrap">
              Controle de frequência acadêmica
            </p>
          </div>
        </div>

        <div
          className="w-full h-[4px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"
          aria-hidden="true"
        />

        <nav
          className="sidebar-nav h-full"
          aria-label="Navegação principal do painel"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pendingRoute
              ? pendingRoute === item.href
              : pathname === item.href;

            return (
              <div key={item.href} className="w-full font-semibold text-white">
                <Link
                  href={item.href}
                  onClick={(event) => handleNavigate(event, item.href)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  aria-label={`Ir para ${item.label}`}
                  className={cn(
                    "group flex items-center justify-between gap-2",
                    "rounded-md h-[45px] text-[11px] uppercase tracking-[0.12em]",
                    "transition-colors text-white",
                    "outline-none focus:outline-none focus-visible:outline-none",
                    "focus:ring-0 focus-visible:ring-0",
                    active ? "bg-[#00923F]" : "hover:bg-slate-800",
                    isLoggingOut ? "pointer-events-none opacity-80" : "",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>

                  <ChevronRight
                    className={cn(
                      "h-3 w-3 text-white transition-opacity",
                      active
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-100",
                    )}
                    aria-hidden="true"
                  />
                </Link>

                {item.label === "DASHBOARD" && (
                  <div
                    className="mt-4 mb-6 w-full h-[4px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto mb-4">
        <div
          className="w-full mb-3 h-[4px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label={
            isLoggingOut ? "Saindo da aplicação" : "Sair da aplicação"
          }
          className={cn(
            "h-[40px] w-full flex items-center justify-between px-3",
            "rounded-md text-[11px] uppercase tracking-[0.12em]",
            "text-white hover:bg-slate-800 transition-colors",
            "outline-none focus:outline-none focus-visible:outline-none",
            "focus:ring-0 focus-visible:ring-0",
            isLoggingOut ? "pointer-events-none opacity-80" : "",
          )}
        >
          <span className="flex items-center gap-2">
            {isLoggingOut ? (
              <Loader2
                className="h-4 w-4 text-white animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LogOut className="h-4 w-4 text-white" aria-hidden="true" />
            )}
            {isLoggingOut ? "Saindo" : "Sair"}
          </span>

          <ChevronRight
            className="h-3 w-3 opacity-60 text-white"
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}
