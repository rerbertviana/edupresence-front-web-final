import type { QueryKey } from "@tanstack/react-query";
import { fetchSubjects } from "./service";

export const subjectsKeys = {
  all: ["subjects"] as const,
  subjects: (): QueryKey => ["subjects"],
};

export const subjectsQueries = {
  subjects: () => ({
    queryKey: subjectsKeys.subjects(),
    queryFn: fetchSubjects,
    refetchOnWindowFocus: true,
  }),
};
