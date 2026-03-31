import {
  fetchCourses,
  fetchStudents,
  fetchClassSubjects,
  fetchEnrollments,
} from "./service";

export const enrollmentsQueries = {
  courses: () => ({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  }),

  students: (courseId?: number | null) => ({
    queryKey: ["students", courseId ?? null],
    queryFn: () => fetchStudents(courseId ?? null),
    enabled: !!courseId && !Number.isNaN(courseId) && courseId > 0,
  }),

  classSubjects: (courseId?: number | null) => ({
    queryKey: ["class-subjects", courseId ?? null],
    queryFn: () => fetchClassSubjects(courseId ?? null),
    enabled: !!courseId && !Number.isNaN(courseId) && courseId > 0,
  }),

  enrollments: () => ({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollments,
  }),
};
