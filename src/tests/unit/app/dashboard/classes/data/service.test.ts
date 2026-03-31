import {
  fetchCourses,
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
} from "@/app/dashboard/classes/data/service";

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

describe("classes service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch courses", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, name: "SI" }],
    });

    const result = await fetchCourses();

    expect(mockedApi.get).toHaveBeenCalledWith("/courses");
    expect(result).toEqual([{ id: 1, name: "SI" }]);
  });

  it("should fetch classes", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, semester: "2025.1" }],
    });

    const result = await fetchClasses();

    expect(mockedApi.get).toHaveBeenCalledWith("/classes");
    expect(result).toEqual([{ id: 1, semester: "2025.1" }]);
  });

  it("should create class", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createClass({
      courseId: 1,
      semester: "2025.1",
      shift: "MORNING",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/classes", {
      courseId: 1,
      semester: "2025.1",
      shift: "MORNING",
    });
  });

  it("should update class", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateClass(10, {
      courseId: 1,
      semester: "2025.1",
      shift: "AFTERNOON",
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/classes/10", {
      courseId: 1,
      semester: "2025.1",
      shift: "AFTERNOON",
    });
  });

  it("should delete class", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteClass(5);

    expect(mockedApi.delete).toHaveBeenCalledWith("/classes/5");
  });
});
