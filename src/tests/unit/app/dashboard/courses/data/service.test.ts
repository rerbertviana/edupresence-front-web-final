import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/app/dashboard/courses/data/service";

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

describe("courses service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch courses", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, name: "Sistemas de Informação" }],
    });

    const result = await fetchCourses();

    expect(mockedApi.get).toHaveBeenCalledWith("/courses");
    expect(result).toEqual([{ id: 1, name: "Sistemas de Informação" }]);
  });

  it("should create course with trimmed name", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createCourse("  ADS  ");

    expect(mockedApi.post).toHaveBeenCalledWith("/courses", {
      name: "ADS",
    });
  });

  it("should throw when createCourse receives empty name", async () => {
    await expect(createCourse("   ")).rejects.toThrow(
      "Informe o nome do curso.",
    );
  });

  it("should update course with trimmed name", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateCourse(10, "  Engenharia de Software  ");

    expect(mockedApi.put).toHaveBeenCalledWith("/courses/10", {
      name: "Engenharia de Software",
    });
  });

  it("should throw when updateCourse receives empty name", async () => {
    await expect(updateCourse(10, "   ")).rejects.toThrow(
      "Informe o nome do curso.",
    );
  });

  it("should delete course", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteCourse(5);

    expect(mockedApi.delete).toHaveBeenCalledWith("/courses/5");
  });
});
