import { normalizeText } from "@/app/dashboard/students/helpers/helpers";

describe("students helpers", () => {
  it("should normalize text correctly", () => {
    expect(normalizeText("  João Ávila  ")).toBe("joao avila");
  });

  it("should keep numbers and normalize mixed text", () => {
    expect(normalizeText("  SI 2025.1  ")).toBe("si 2025.1");
  });

  it("should return empty string for empty input", () => {
    expect(normalizeText("")).toBe("");
  });
});
