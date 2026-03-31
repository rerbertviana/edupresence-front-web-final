import { normalizeText } from "@/app/dashboard/subjects/helpers/helpers";

describe("subjects helpers", () => {
  it("should normalize text correctly", () => {
    expect(normalizeText("  Álgebra Linear  ")).toBe("algebra linear");
  });

  it("should keep numbers and normalize mixed text", () => {
    expect(normalizeText("  Banco de Dados 60h  ")).toBe("banco de dados 60h");
  });

  it("should return empty string for empty input", () => {
    expect(normalizeText("")).toBe("");
  });
});
