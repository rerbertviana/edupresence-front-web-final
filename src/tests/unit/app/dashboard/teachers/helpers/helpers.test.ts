import {
  normalizeText,
  parseBackendMessage,
} from "@/app/dashboard/teachers/helpers/helpers";

describe("teachers helpers", () => {
  it("should normalize text correctly", () => {
    expect(normalizeText("  João Ávila  ")).toBe("joao avila");
  });

  it("should keep numbers and normalize mixed text", () => {
    expect(normalizeText("  SIAPE 123  ")).toBe("siape 123");
  });

  it("should return response.data.message from parseBackendMessage", () => {
    const err = {
      response: {
        data: {
          message: "Teacher error message",
        },
      },
    };

    expect(parseBackendMessage(err)).toBe("Teacher error message");
  });

  it("should return response.data.error from parseBackendMessage", () => {
    const err = {
      response: {
        data: {
          error: "Teacher error fallback",
        },
      },
    };

    expect(parseBackendMessage(err)).toBe("Teacher error fallback");
  });

  it("should return err.message from parseBackendMessage", () => {
    expect(parseBackendMessage(new Error("Generic error"))).toBe(
      "Generic error",
    );
  });

  it("should return fallback message from parseBackendMessage", () => {
    expect(parseBackendMessage(undefined)).toBe("Erro inesperado.");
  });
});
