"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ToastState } from "@/components/ui/toast";

import { adminDashboardQueries } from "../data/queries";
import { translateAdminDashboardMessage } from "../domain/messages";
import {
  buildCoursesChartData,
  buildLowestClassesChartData,
  buildOverviewData,
  getBarChartHeight,
} from "../helpers/chart";
import { parseBackendMessage } from "../helpers/format";

export function useAdminDashboardController() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const overviewQuery = useQuery(adminDashboardQueries.overview());
  const coursesQuery = useQuery(
    adminDashboardQueries.coursesAttendanceSummary(),
  );
  const lowestClassesQuery = useQuery(
    adminDashboardQueries.lowestAttendanceClasses(),
  );

  const hasAnyError =
    overviewQuery.isError || coursesQuery.isError || lowestClassesQuery.isError;

  useEffect(() => {
    if (!hasAnyError) return;

    const rawMessage =
      parseBackendMessage(overviewQuery.error) ||
      parseBackendMessage(coursesQuery.error) ||
      parseBackendMessage(lowestClassesQuery.error) ||
      "Erro ao carregar dashboard do administrador.";

    setToast({
      id: Date.now(),
      type: "error",
      message: translateAdminDashboardMessage(rawMessage),
    });
  }, [
    hasAnyError,
    overviewQuery.error,
    coursesQuery.error,
    lowestClassesQuery.error,
  ]);

  const overview = useMemo(
    () => buildOverviewData(overviewQuery.data),
    [overviewQuery.data],
  );

  const coursesChartData = useMemo(
    () => buildCoursesChartData(coursesQuery.data ?? []),
    [coursesQuery.data],
  );

  const lowestClassesChartData = useMemo(
    () => buildLowestClassesChartData(lowestClassesQuery.data ?? []),
    [lowestClassesQuery.data],
  );

  const coursesChartHeight = useMemo(
    () => getBarChartHeight(coursesChartData.length),
    [coursesChartData.length],
  );

  const lowestClassesChartHeight = useMemo(
    () => getBarChartHeight(lowestClassesChartData.length),
    [lowestClassesChartData.length],
  );

  function closeToast() {
    setToast(null);
  }

  return {
    toast,
    closeToast,

    overview,
    coursesChartData,
    lowestClassesChartData,
    coursesChartHeight,
    lowestClassesChartHeight,

    isLoadingOverview: overviewQuery.isLoading,
    isLoadingCourses: coursesQuery.isLoading,
    isLoadingLowestClasses: lowestClassesQuery.isLoading,
  };
}
