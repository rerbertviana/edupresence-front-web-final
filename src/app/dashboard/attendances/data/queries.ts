export const attendancesKeys = {
  classSubjectsTeacher: () => ["class-subjects", "teacher"] as const,
  lessonsByClassSubject: (classSubjectId: number | null, all: boolean) =>
    ["lessons", "by-class-subject", classSubjectId, all] as const,
  attendancesByLesson: (lessonId: number | null) =>
    ["attendances", "by-lesson", lessonId] as const,
};
