import { attendancesService } from "@/app/dashboard/attendances/data/service";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("attendancesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch teacher class subjects", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1 }] });

    const result = await attendancesService.getTeacherClassSubjects();

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/class-subjects/filters/teacher",
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it("should fetch lessons by class subject", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 2 }] });

    const result = await attendancesService.getLessonsByClassSubject(7);

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/lessons/filters/by-class-subject/7",
    );
    expect(result).toEqual([{ id: 2 }]);
  });

  it("should fetch upcoming lessons by class subject", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 3 }] });

    const result = await attendancesService.getUpcomingLessonsByClassSubject(8);

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/lessons/filters/by-class-subject/8/upcoming",
    );
    expect(result).toEqual([{ id: 3 }]);
  });

  it("should fetch attendances by lesson", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 4 }] });

    const result = await attendancesService.getAttendancesByLesson(22);

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/attendances/filters/by-lesson/22",
    );
    expect(result).toEqual([{ id: 4 }]);
  });

  it("should update lesson status", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await attendancesService.updateLessonStatus({
      lesson: {
        id: 1,
        classSubjectId: 99,
        date: "2026-03-08",
        startTime: "08:00",
        endTime: "10:00",
        status: "OPEN",
      },
      nextStatus: "CLOSED",
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/lessons/1", {
      classSubjectId: 99,
      date: "2026-03-08",
      startTime: "08:00",
      endTime: "10:00",
      status: "CLOSED",
    });
  });

  it("should update attendance status manually", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await attendancesService.updateAttendanceStatus({
      id: 15,
      status: "PRESENT",
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/attendances/15", {
      status: "PRESENT",
      recordType: "MANUAL",
    });
  });

  it("should update attendances in bulk", async () => {
    mockedApi.put.mockResolvedValue({});

    await attendancesService.bulkUpdateAttendancesStatus({
      ids: [1, 2, 3],
      status: "ABSENT",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(1, "/attendances/1", {
      status: "ABSENT",
      recordType: "MANUAL",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(2, "/attendances/2", {
      status: "ABSENT",
      recordType: "MANUAL",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(3, "/attendances/3", {
      status: "ABSENT",
      recordType: "MANUAL",
    });
  });
});
