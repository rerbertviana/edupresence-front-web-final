import {
  fetchCourses,
  fetchClasses,
  fetchSubjects,
  fetchTeachers,
  fetchClassSubjects,
} from "./service";

export const classSubjectsKeys = {
  courses: ["courses"] as const,
  classes: ["classes"] as const,
  subjects: ["subjects"] as const,
  teachers: ["teachers"] as const,
  classSubjects: ["class-subjects"] as const,
};

export const classSubjectsQueries = {
  courses: () => ({
    queryKey: classSubjectsKeys.courses,
    queryFn: fetchCourses,
    refetchOnWindowFocus: true,
  }),
  classes: () => ({
    queryKey: classSubjectsKeys.classes,
    queryFn: fetchClasses,
    refetchOnWindowFocus: true,
  }),
  subjects: () => ({
    queryKey: classSubjectsKeys.subjects,
    queryFn: fetchSubjects,
    refetchOnWindowFocus: true,
  }),
  teachers: () => ({
    queryKey: classSubjectsKeys.teachers,
    queryFn: fetchTeachers,
    refetchOnWindowFocus: true,
  }),
  classSubjects: () => ({
    queryKey: classSubjectsKeys.classSubjects,
    queryFn: fetchClassSubjects,
    refetchOnWindowFocus: true,
  }),
};
