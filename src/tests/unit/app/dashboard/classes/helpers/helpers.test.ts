import {
  shiftLabel,
  shiftPillClass,
  compareClassesBySemesterDesc,
  buildYears,
} from "@/app/dashboard/classes/helpers/helpers";

import {
  compareBySemesterDescAndShift,
  getShiftLabel as getAcademicShiftLabel,
} from "@/helpers/academic";

jest.mock("@/helpers/academic", () => ({
  compareBySemesterDescAndShift: jest.fn(),
  getShiftLabel: jest.fn(),
  parseSemester: jest.fn(),
  shiftOrder: jest.fn(),
}));

const mockedCompare = compareBySemesterDescAndShift as jest.Mock;
const mockedShiftLabel = getAcademicShiftLabel as jest.Mock;

describe("classes helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delegate shiftLabel to academic helper", () => {
    mockedShiftLabel.mockReturnValue("Manhã");

    const result = shiftLabel("MORNING" as any);

    expect(mockedShiftLabel).toHaveBeenCalledWith("MORNING");
    expect(result).toBe("Manhã");
  });

  it("should return correct pill class for MORNING", () => {
    const result = shiftPillClass("MORNING" as any);
    expect(result).toContain("bg-yellow-100");
  });

  it("should return correct pill class for AFTERNOON", () => {
    const result = shiftPillClass("AFTERNOON" as any);
    expect(result).toContain("bg-orange-100");
  });

  it("should return correct pill class for NIGHT", () => {
    const result = shiftPillClass("NIGHT" as any);
    expect(result).toContain("bg-blue-100");
  });

  it("should return fallback pill class", () => {
    const result = shiftPillClass("OTHER" as any);
    expect(result).toContain("bg-gray-100");
  });

  it("should delegate compareClassesBySemesterDesc", () => {
    mockedCompare.mockReturnValue(-1);

    const a = { semester: "2025.1" } as any;
    const b = { semester: "2024.2" } as any;

    const result = compareClassesBySemesterDesc(a, b);

    expect(mockedCompare).toHaveBeenCalledWith(a, b);
    expect(result).toBe(-1);
  });

  it("should build year range correctly", () => {
    const years = buildYears(3);

    expect(years.length).toBe(4);
    expect(years[0]).toBe(new Date().getFullYear());
  });
});
