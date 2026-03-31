import {
  normalizeText,
  sortByNamePtBR,
  ensureNonEmptyName,
} from "@/app/dashboard/courses/helpers/helpers";

describe("courses helpers", () => {
  it("should normalize text correctly", () => {
    expect(normalizeText("  Ciência da Computação  ")).toBe(
      "ciencia da computacao",
    );
  });

  it("should return empty string when normalizeText receives empty value", () => {
    expect(normalizeText("")).toBe("");
  });

  it("should sort names using pt-BR locale rules", () => {
    const items = [
      { name: "Zootecnia" },
      { name: "Análise e Desenvolvimento de Sistemas" },
      { name: "Ciência da Computação" },
    ];

    const sorted = [...items].sort(sortByNamePtBR);

    expect(sorted.map((item) => item.name)).toEqual([
      "Análise e Desenvolvimento de Sistemas",
      "Ciência da Computação",
      "Zootecnia",
    ]);
  });

  it("should handle missing names in sortByNamePtBR", () => {
    const items = [{}, { name: "ADS" }, { name: "" }];

    const sorted = [...items].sort(sortByNamePtBR);

    expect(sorted[sorted.length - 1].name).toBe("ADS");
  });

  it("should return trimmed name in ensureNonEmptyName", () => {
    expect(ensureNonEmptyName("  Sistemas de Informação  ")).toBe(
      "Sistemas de Informação",
    );
  });

  it("should throw error when ensureNonEmptyName receives empty value", () => {
    expect(() => ensureNonEmptyName("   ")).toThrow("Informe o nome do curso.");
  });
});
