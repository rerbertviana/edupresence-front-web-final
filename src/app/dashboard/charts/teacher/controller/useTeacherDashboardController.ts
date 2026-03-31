"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import type { ToastState } from "@/components/ui/toast";

import { teacherDashboardQueries } from "../data/queries";
import { translateTeacherDashboardMessage } from "../domain/messages";
import {
  buildAbsentRankingData,
  buildAttendanceChartData,
  buildAttendanceTimeSeriesData,
  getAttendanceChartHeight,
} from "../helpers/chart";

export function useTeacherDashboardController() {
  const { user } = useAuth();
  const teacherId = user?.id ?? null;

  const [toast, setToast] = useState<ToastState | null>(null);

  const summaryQuery = useQuery(
    teacherDashboardQueries.attendanceSummary(teacherId),
  );

  const absentQuery = useQuery(
    teacherDashboardQueries.topAbsentStudents(teacherId),
  );

  const timeSeriesQuery = useQuery(
    teacherDashboardQueries.attendanceTimeSeries(teacherId),
  );

  const attendanceChartData = useMemo(
    () => buildAttendanceChartData(summaryQuery.data ?? []),
    [summaryQuery.data],
  );

  const absentRankingData = useMemo(
    () => buildAbsentRankingData(absentQuery.data ?? []),
    [absentQuery.data],
  );

  const attendanceTimeSeriesData = useMemo(
    () => buildAttendanceTimeSeriesData(timeSeriesQuery.data ?? []),
    [timeSeriesQuery.data],
  );

  const totalAbsences = useMemo(
    () => absentRankingData.reduce((acc, item) => acc + item.absent, 0),
    [absentRankingData],
  );

  const attendanceChartHeight = useMemo(
    () => getAttendanceChartHeight(attendanceChartData.length),
    [attendanceChartData.length],
  );

  const hasAnyError =
    summaryQuery.isError || absentQuery.isError || timeSeriesQuery.isError;

  useEffect(() => {
    if (!hasAnyError) return;

    const rawMessage =
      (summaryQuery.error as any)?.response?.data?.message ||
      (absentQuery.error as any)?.response?.data?.message ||
      (timeSeriesQuery.error as any)?.response?.data?.message ||
      (summaryQuery.error as any)?.message ||
      (absentQuery.error as any)?.message ||
      (timeSeriesQuery.error as any)?.message ||
      "Erro ao carregar gráficos do dashboard.";

    setToast({
      id: Date.now(),
      type: "error",
      message: translateTeacherDashboardMessage(rawMessage),
    });
  }, [
    hasAnyError,
    summaryQuery.error,
    absentQuery.error,
    timeSeriesQuery.error,
  ]);

  function closeToast() {
    setToast(null);
  }

  return {
    toast,
    closeToast,

    attendanceChartData,
    absentRankingData,
    attendanceTimeSeriesData,
    totalAbsences,
    attendanceChartHeight,

    isLoadingSummary: summaryQuery.isLoading,
    isLoadingAbsent: absentQuery.isLoading,
    isLoadingTimeSeries: timeSeriesQuery.isLoading,
  };
}
