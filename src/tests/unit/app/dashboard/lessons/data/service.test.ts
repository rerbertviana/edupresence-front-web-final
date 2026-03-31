import {
  fetchTeacherClassSubjects,
  fetchLessonsByClassSubject,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonStatus,
} from "@/app/dashboard/lessons/data/service";

import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("lessons service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch teacher class subjects", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1 }],
    });

    const result = await fetchTeacherClassSubjects();

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/class-subjects/filters/teacher",
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it("should fetch all lessons by class subject", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 10 }],
    });

    const result = await fetchLessonsByClassSubject({
      classSubjectId: 5,
      all: true,
    });

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/lessons/filters/by-class-subject/5",
    );
    expect(result).toEqual([{ id: 10 }]);
  });

  it("should fetch upcoming lessons by class subject", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 11 }],
    });

    const result = await fetchLessonsByClassSubject({
      classSubjectId: 5,
      all: false,
    });

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/lessons/filters/by-class-subject/5/upcoming",
    );
    expect(result).toEqual([{ id: 11 }]);
  });

  it("should create lesson", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createLesson({
      classSubjectId: 1,
      date: "2026-03-08",
      startTimeISO: "08:00",
      endTimeISO: "10:00",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/lessons", {
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "08:00",
      endTime: "10:00",
    });
  });

  it("should update lesson", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateLesson({
      lessonId: 7,
      classSubjectId: 1,
      date: "2026-03-08",
      startTimeISO: "08:00",
      endTimeISO: "10:00",
      status: "OPEN",
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/lessons/7", {
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "08:00",
      endTime: "10:00",
      status: "OPEN",
    });
  });

  it("should delete lesson", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteLesson(9);

    expect(mockedApi.delete).toHaveBeenCalledWith("/lessons/9");
  });

  it("should update lesson status", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateLessonStatus({
      lesson: {
        id: 12,
        classSubjectId: 2,
        date: "2026-03-08",
        startTime: "08:00",
        endTime: "10:00",
      } as any,
      nextStatus: "CLOSED",
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/lessons/12", {
      classSubjectId: 2,
      date: "2026-03-08",
      startTime: "08:00",
      endTime: "10:00",
      status: "CLOSED",
    });
  });
});
