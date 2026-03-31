import type { QueryKey } from "@tanstack/react-query";
import { fetchCourses, fetchStudents } from "./service";

export const studentsKeys = {
  all: ["students"] as const,
  students: (): QueryKey => ["students"],
  courses: (): QueryKey => ["courses"],
};

export const studentsQueries = {
  students: () => ({
    queryKey: studentsKeys.students(),
    queryFn: fetchStudents,
    refetchOnWindowFocus: true,
  }),
  courses: () => ({
    queryKey: studentsKeys.courses(),
    queryFn: fetchCourses,
    refetchOnWindowFocus: true,
  }),
};
