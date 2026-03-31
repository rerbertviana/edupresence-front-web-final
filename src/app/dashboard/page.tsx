"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/contexts/AuthContext";

import AdminDashboardCharts from "./charts/admin/page";
import TeacherDashboardCharts from "./charts/teacher/page";

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <AdminDashboardCharts />;
    case "TEACHER":
      return <TeacherDashboardCharts />;
    default:
      return (
        <DashboardShell>
          <div className="p-6 text-sm text-red-600">
            Perfil sem permissão para dashboard.
          </div>
        </DashboardShell>
      );
  }
}
