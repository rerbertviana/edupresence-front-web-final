import {
  getShiftLabel,
  compareClassesBySemesterShiftDesc,
  getShiftBadgeClass,
} from "@/app/dashboard/class-subjects/helpers/helpers";
import type { ClassDTO } from "@/app/dashboard/class-subjects/domain/types";
import {
  compareBySemesterDescAndShift,
  getShiftLabel as getAcademicShiftLabel,
} from "@/helpers/academic";

jest.mock("@/helpers/academic", () => ({
  compareBySemesterDescAndShift: jest.fn(),
  getShiftLabel: jest.fn(),
}));

const mockedCompareBySemesterDescAndShift =
  compareBySemesterDescAndShift as jest.Mock;
const mockedGetAcademicShiftLabel = getAcademicShiftLabel as jest.Mock;

describe("class-subjects helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delegate getShiftLabel to academic helper", () => {
    mockedGetAcademicShiftLabel.mockReturnValue("Manhã");

    const result = getShiftLabel("MORNING");

    expect(mockedGetAcademicShiftLabel).toHaveBeenCalledWith("MORNING");
    expect(result).toBe("Manhã");
  });

  it("should delegate compareClassesBySemesterShiftDesc to academic helper", () => {
    const classA = {
      id: 1,
      semester: "2025.1",
      shift: "MORNING",
    } as ClassDTO;

    const classB = {
      id: 2,
      semester: "2024.2",
      shift: "NIGHT",
    } as ClassDTO;

    mockedCompareBySemesterDescAndShift.mockReturnValue(-1);

    const result = compareClassesBySemesterShiftDesc(classA, classB);

    expect(mockedCompareBySemesterDescAndShift).toHaveBeenCalledWith(
      classA,
      classB,
    );
    expect(result).toBe(-1);
  });

  it("should return MORNING badge classes", () => {
    expect(getShiftBadgeClass("MORNING")).toContain("bg-amber-50");
    expect(getShiftBadgeClass("MORNING")).toContain("text-amber-700");
    expect(getShiftBadgeClass("MORNING")).toContain("border-amber-200");
  });

  it("should return AFTERNOON badge classes", () => {
    expect(getShiftBadgeClass("AFTERNOON")).toContain("bg-orange-50");
    expect(getShiftBadgeClass("AFTERNOON")).toContain("text-orange-700");
    expect(getShiftBadgeClass("AFTERNOON")).toContain("border-orange-200");
  });

  it("should return NIGHT badge classes", () => {
    expect(getShiftBadgeClass("NIGHT")).toContain("bg-indigo-50");
    expect(getShiftBadgeClass("NIGHT")).toContain("text-indigo-700");
    expect(getShiftBadgeClass("NIGHT")).toContain("border-indigo-200");
  });

  it("should return fallback badge classes for unknown shift", () => {
    expect(getShiftBadgeClass("OTHER")).toContain("bg-slate-50");
    expect(getShiftBadgeClass("OTHER")).toContain("text-slate-700");
    expect(getShiftBadgeClass("OTHER")).toContain("border-slate-200");
  });

  it("should return fallback badge classes when shift is undefined", () => {
    expect(getShiftBadgeClass(undefined)).toContain("bg-slate-50");
    expect(getShiftBadgeClass(undefined)).toContain("text-slate-700");
    expect(getShiftBadgeClass(undefined)).toContain("border-slate-200");
  });
});
