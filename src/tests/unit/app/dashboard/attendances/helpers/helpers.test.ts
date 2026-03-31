import {
  parseBackendMessage,
  formatDateBR,
  extractHHMM,
  formatTimeBR,
  getLessonEndLocal,
  isLessonExpired,
  compareClassSubjectsBySemesterDesc,
  shiftLabel,
  shiftPillClass,
} from "@/app/dashboard/attendances/helpers/helpers";
import type {
  ClassSubjectDTO,
  LessonDTO,
} from "@/app/dashboard/attendances/domain/types";

jest.mock("@/helpers/academic", () => ({
  getShiftLabel: jest.fn((shift: string) => {
    if (shift === "MORNING") return "Manhã";
    if (shift === "AFTERNOON") return "Tarde";
    if (shift === "NIGHT") return "Noite";
    return "Turno";
  }),
  normalizeText: jest.fn((v: string) =>
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  ),
  parseSemester: jest.fn((semester: string) => {
    if (!semester) return { year: 0, term: 0 };
    const [year, term] = semester.split(".").map(Number);
    return { year, term };
  }),
  shiftOrder: jest.fn((shift: string) => {
    if (shift === "MORNING") return 0;
    if (shift === "AFTERNOON") return 1;
    if (shift === "NIGHT") return 2;
    return 99;
  }),
}));

describe("helpers - attendances", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-08T15:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return response.data.message from parseBackendMessage", () => {
    expect(
      parseBackendMessage({
        response: { data: { message: "Mensagem de erro" } },
      }),
    ).toBe("Mensagem de erro");
  });

  it("should return response.data.error from parseBackendMessage", () => {
    expect(
      parseBackendMessage({
        response: { data: { error: "Erro alternativo" } },
      }),
    ).toBe("Erro alternativo");
  });

  it("should return err.message from parseBackendMessage", () => {
    expect(parseBackendMessage(new Error("Erro JS"))).toBe("Erro JS");
  });

  it("should return fallback from parseBackendMessage", () => {
    expect(parseBackendMessage(undefined)).toBe("Erro inesperado.");
  });

  it("should format YYYY-MM-DD in formatDateBR", () => {
    expect(formatDateBR("2026-03-08")).toBe("08/03/2026");
  });

  it("should format ISO date with T in formatDateBR", () => {
    expect(formatDateBR("2026-03-08T10:00:00.000Z")).toBe("08/03/2026");
  });

  it("should return dash for invalid date in formatDateBR", () => {
    expect(formatDateBR("abc")).toBe("—");
    expect(formatDateBR(null)).toBe("—");
  });

  it("should extract HH:MM from plain time string", () => {
    expect(extractHHMM("13:45")).toBe("13:45");
  });

  it("should extract HH:MM from ISO datetime", () => {
    expect(extractHHMM("2026-03-08T18:20:00.000Z")).toBe("18:20");
  });

  it("should return null for invalid time in extractHHMM", () => {
    expect(extractHHMM("abc")).toBeNull();
  });

  it("should keep HH:MM in formatTimeBR", () => {
    expect(formatTimeBR("07:30")).toBe("07:30");
  });

  it("should return dash for empty time in formatTimeBR", () => {
    expect(formatTimeBR(undefined)).toBe("—");
  });

  it("should build local lesson end date in getLessonEndLocal", () => {
    const lesson: LessonDTO = {
      id: 1,
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "13:00",
      endTime: "16:30",
      status: "OPEN",
    };

    const result = getLessonEndLocal(lesson);

    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(8);
    expect(result?.getHours()).toBe(16);
    expect(result?.getMinutes()).toBe(30);
  });

  it("should return true when lesson is expired", () => {
    const lesson: LessonDTO = {
      id: 1,
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "10:00",
      endTime: "12:00",
      status: "CLOSED",
    };

    expect(isLessonExpired(lesson)).toBe(true);
  });

  it("should return false when lesson is not expired", () => {
    const lesson: LessonDTO = {
      id: 1,
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "16:00",
      endTime: "18:00",
      status: "OPEN",
    };

    expect(isLessonExpired(lesson)).toBe(false);
  });

  it("should compare class subjects by semester descending", () => {
    const a = {
      id: 1,
      classId: 1,
      subjectId: 1,
      teacherId: 1,
      class: {
        id: 1,
        courseId: 1,
        semester: "2025.1",
        shift: "MORNING",
        course: { id: 1, name: "SI" },
      },
      subject: { id: 1, name: "Algoritmos", workload: 60 },
      teacher: {
        id: 1,
        siapeCode: "123",
        teachingArea: "TI",
        user: {
          id: 1,
          fullName: "Professor A",
          email: "a@a.com",
          role: "TEACHER",
          createdAt: "2026-01-01",
        },
      },
    } as ClassSubjectDTO;

    const b = {
      ...a,
      id: 2,
      class: {
        ...a.class,
        semester: "2026.1",
        shift: "MORNING",
      },
    } as ClassSubjectDTO;

    expect(compareClassSubjectsBySemesterDesc(a, b)).toBeGreaterThan(0);
  });

  it("should return the academic shift label", () => {
    expect(shiftLabel("MORNING")).toBe("Manhã");
  });

  it("should return MORNING pill class", () => {
    expect(shiftPillClass("MORNING")).toContain("bg-yellow-100");
  });

  it("should return AFTERNOON pill class", () => {
    expect(shiftPillClass("AFTERNOON")).toContain("bg-orange-100");
  });

  it("should return NIGHT pill class", () => {
    expect(shiftPillClass("NIGHT")).toContain("bg-blue-100");
  });

  it("should return fallback pill class", () => {
    expect(shiftPillClass("OTHER")).toContain("bg-gray-100");
  });
});
