import { fetchTeachers } from "./service";

export const teachersKeys = {
  teachers: ["teachers"] as const,
};

export const teachersQueries = {
  teachers: () => ({
    queryKey: teachersKeys.teachers,
    queryFn: fetchTeachers,
    refetchOnWindowFocus: true,
  }),
};
