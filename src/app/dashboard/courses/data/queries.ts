"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "./service";
import type { CourseDTO } from "../domain/types";

export const coursesQueryKey = ["courses"] as const;

export function useCoursesQuery() {
  return useQuery<CourseDTO[]>({
    queryKey: coursesQueryKey,
    queryFn: fetchCourses,
    refetchOnWindowFocus: true,
  });
}
