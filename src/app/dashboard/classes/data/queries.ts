"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClassDTO, CourseDTO } from "../domain/types";
import { fetchClasses, fetchCourses } from "./service";

export const coursesQueryKey = ["courses"] as const;
export const classesQueryKey = ["classes"] as const;

export function useCoursesQuery() {
  return useQuery<CourseDTO[]>({
    queryKey: coursesQueryKey,
    queryFn: fetchCourses,
    refetchOnWindowFocus: true,
  });
}

export function useClassesQuery() {
  return useQuery<ClassDTO[]>({
    queryKey: classesQueryKey,
    queryFn: fetchClasses,
    refetchOnWindowFocus: true,
  });
}
