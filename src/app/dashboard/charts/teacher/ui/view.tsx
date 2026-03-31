"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Toast } from "@/components/ui/toast";

import { useTeacherDashboardController } from "../controller/useTeacherDashboardController";
import { AttendanceByDisciplineChart } from "./components/AttendanceByDisciplineChart";
import { TopAbsentStudentsChart } from "./components/TopAbsentStudentsChart";
import { AttendanceEvolutionChart } from "./components/AttendanceEvolutionChart";

export function TeacherDashboardView() {
  const {
    toast,
    closeToast,
    attendanceChartData,
    absentRankingData,
    attendanceTimeSeriesData,
    totalAbsences,
    attendanceChartHeight,
    isLoadingSummary,
    isLoadingAbsent,
    isLoadingTimeSeries,
  } = useTeacherDashboardController();

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
              Dashboard do Professor
            </h1>
            <p className="text-xs text-gray-500">
              Panorama rápido de presença, faltas e evolução ao longo das aulas.
            </p>
          </div>

          <div className="p-4 flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <AttendanceByDisciplineChart
                data={attendanceChartData}
                isLoading={isLoadingSummary}
                height={attendanceChartHeight}
              />

              <div className="xl:col-span-5 space-y-6">
                <TopAbsentStudentsChart
                  data={absentRankingData}
                  totalAbsences={totalAbsences}
                  isLoading={isLoadingAbsent}
                />

                <AttendanceEvolutionChart
                  data={attendanceTimeSeriesData}
                  isLoading={isLoadingTimeSeries}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
