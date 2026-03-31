"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Toast } from "@/components/ui/toast";

import { useAdminDashboardController } from "../controller/useAdminDashboardController";
import { AdminOverviewStats } from "./components/AdminOverviewStats";
import { CourseAttendanceChart } from "./components/CourseAttendanceChart";
import { WorstClassesChart } from "./components/WorstClassesChart";

export function AdminDashboardView() {
  const {
    toast,
    closeToast,
    overview,
    coursesChartData,
    lowestClassesChartData,
    coursesChartHeight,
    lowestClassesChartHeight,
    isLoadingCourses,
    isLoadingLowestClasses,
  } = useAdminDashboardController();

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={closeToast}
            />
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-1 shrink-0">
            <h1 className="text-lg font-semibold text-gray-800">
              Dashboard do Administrador
            </h1>
            <p className="text-xs text-gray-500">
              Panorama geral do sistema, frequência por curso e ranking das
              piores turmas.
            </p>
          </div>

          <div className="p-4 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-6">
              <AdminOverviewStats overview={overview} />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <CourseAttendanceChart
                  data={coursesChartData}
                  isLoading={isLoadingCourses}
                  height={coursesChartHeight}
                />

                <WorstClassesChart
                  data={lowestClassesChartData}
                  isLoading={isLoadingLowestClasses}
                  height={lowestClassesChartHeight}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
