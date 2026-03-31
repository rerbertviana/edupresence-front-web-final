import {
  formatDateBR,
  formatTimeBR,
  timeInputValueFromISO,
  buildDateTimeISO,
  parseISODateToLocalDate,
  convertToYMD,
  shiftLabel,
  shiftPillClass,
  isLessonExpired,
  compareClassSubjectsBySemesterDesc,
  maskHHMM,
  normalizeText,
} from "@/app/dashboard/lessons/helpers/helpers";

import {
  getShiftLabel as getAcademicShiftLabel,
  parseSemester,
  shiftOrder,
} from "@/helpers/academic";

jest.mock("@/helpers/academic", () => ({
  getShiftLabel: jest.fn(),
  normalizeText: jest.fn((value: string) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim(),
  ),
  parseSemester: jest.fn(),
  shiftOrder: jest.fn(),
}));

const mockedGetAcademicShiftLabel = getAcademicShiftLabel as jest.Mock;
const mockedParseSemester = parseSemester as jest.Mock;
const mockedShiftOrder = shiftOrder as jest.Mock;

describe("lessons helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should format date in BR format", () => {
    expect(formatDateBR("2026-03-08")).toBe("08/03/2026");
    expect(formatDateBR("2026-03-08T00:00:00.000Z")).toBe("08/03/2026");
  });

  it("should return dash for invalid date", () => {
    expect(formatDateBR(undefined)).toBe("—");
    expect(formatDateBR("abc")).toBe("—");
  });

  it("should format time from ISO string", () => {
    expect(formatTimeBR("2026-03-08T14:30:00.000Z")).toBe("14:30");
  });

  it("should return dash for invalid ISO time", () => {
    expect(formatTimeBR(undefined)).toBe("—");
    expect(formatTimeBR("invalid")).toBe("—");
  });

  it("should extract time input value from ISO", () => {
    expect(timeInputValueFromISO("2026-03-08T09:45:00.000Z")).toBe("09:45");
  });

  it("should return empty string for invalid ISO in timeInputValueFromISO", () => {
    expect(timeInputValueFromISO(undefined)).toBe("");
    expect(timeInputValueFromISO("invalid")).toBe("");
  });

  it("should build ISO datetime from date and time", () => {
    const result = buildDateTimeISO("2026-03-08", "10:30");
    expect(typeof result).toBe("string");
    expect(result).toContain("2026-03-08");
  });

  it("should parse ISO date to local date", () => {
    const result = parseISODateToLocalDate("2026-03-08T00:00:00.000Z");

    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(8);
  });

  it("should return undefined for invalid date in parseISODateToLocalDate", () => {
    expect(parseISODateToLocalDate(undefined)).toBeUndefined();
    expect(parseISODateToLocalDate("abc")).toBeUndefined();
  });

  it("should convert date to YMD", () => {
    const result = convertToYMD(new Date(2026, 2, 8));
    expect(result).toBe("2026-03-08");
  });

  it("should delegate shiftLabel to academic helper", () => {
    mockedGetAcademicShiftLabel.mockReturnValue("Manhã");

    const result = shiftLabel("MORNING" as any);

    expect(mockedGetAcademicShiftLabel).toHaveBeenCalledWith("MORNING");
    expect(result).toBe("Manhã");
  });

  it("should return MORNING pill classes", () => {
    expect(shiftPillClass("MORNING" as any)).toContain("bg-yellow-100");
  });

  it("should return AFTERNOON pill classes", () => {
    expect(shiftPillClass("AFTERNOON" as any)).toContain("bg-orange-100");
  });

  it("should return NIGHT pill classes", () => {
    expect(shiftPillClass("NIGHT" as any)).toContain("bg-blue-100");
  });

  it("should return fallback pill classes", () => {
    expect(shiftPillClass("OTHER" as any)).toContain("bg-gray-100");
  });

  it("should return true when lesson is expired", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-08T15:00:00.000Z"));

    const result = isLessonExpired({
      endTime: "2026-03-08T14:00:00.000Z",
    } as any);

    expect(result).toBe(true);

    jest.useRealTimers();
  });

  it("should return false when lesson is not expired", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-08T15:00:00.000Z"));

    const result = isLessonExpired({
      endTime: "2026-03-08T16:00:00.000Z",
    } as any);

    expect(result).toBe(false);

    jest.useRealTimers();
  });

  it("should return false when lesson endTime is invalid", () => {
    expect(isLessonExpired({ endTime: "invalid" } as any)).toBe(false);
  });

  it("should compare class subjects by semester desc", () => {
    mockedParseSemester
      .mockReturnValueOnce({ year: 2025, term: 1 })
      .mockReturnValueOnce({ year: 2024, term: 2 });

    const result = compareClassSubjectsBySemesterDesc(
      { class: { semester: "2025.1", shift: "MORNING" } } as any,
      { class: { semester: "2024.2", shift: "NIGHT" } } as any,
    );

    expect(result).toBeLessThan(0);
  });

  it("should compare class subjects by shift order when semester is equal", () => {
    mockedParseSemester
      .mockReturnValueOnce({ year: 2025, term: 1 })
      .mockReturnValueOnce({ year: 2025, term: 1 });

    mockedShiftOrder.mockReturnValueOnce(0).mockReturnValueOnce(2);

    const result = compareClassSubjectsBySemesterDesc(
      { class: { semester: "2025.1", shift: "MORNING" } } as any,
      { class: { semester: "2025.1", shift: "NIGHT" } } as any,
    );

    expect(result).toBe(-2);
  });

  it("should normalize text", () => {
    expect(normalizeText("  João Ávila  ")).toBe("joao avila");
  });

  it("should mask HHMM input", () => {
    expect(maskHHMM("1234")).toBe("12:34");
    expect(maskHHMM("2999")).toBe("23:59");
    expect(maskHHMM("9")).toBe("2");
    expect(maskHHMM("2368")).toBe("23:58");
  });
});
