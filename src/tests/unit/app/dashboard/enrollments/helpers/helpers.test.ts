import {
  fetchCourses,
  fetchStudents,
  fetchClassSubjects,
  fetchEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "@/app/dashboard/enrollments/data/service";

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

describe("enrollments service", () => {
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

  it("should return empty array when fetchStudents receives invalid courseId", async () => {
    await expect(fetchStudents(undefined)).resolves.toEqual([]);
    await expect(fetchStudents(null)).resolves.toEqual([]);
    await expect(fetchStudents(0)).resolves.toEqual([]);
  });

  it("should fetch students with courseId", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, registrationNumber: "2025001" }],
    });

    const result = await fetchStudents(10);

    expect(mockedApi.get).toHaveBeenCalledWith("/students", {
      params: { courseId: 10 },
    });
    expect(result).toEqual([{ id: 1, registrationNumber: "2025001" }]);
  });

  it("should return empty array when fetchClassSubjects receives invalid courseId", async () => {
    await expect(fetchClassSubjects(undefined)).resolves.toEqual([]);
    await expect(fetchClassSubjects(null)).resolves.toEqual([]);
    await expect(fetchClassSubjects(0)).resolves.toEqual([]);
  });

  it("should fetch class subjects with courseId", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, classId: 2, subjectId: 3, teacherId: 4 }],
    });

    const result = await fetchClassSubjects(7);

    expect(mockedApi.get).toHaveBeenCalledWith("/class-subjects", {
      params: { courseId: 7 },
    });
    expect(result).toEqual([{ id: 1, classId: 2, subjectId: 3, teacherId: 4 }]);
  });

  it("should fetch enrollments", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, studentId: 2, classSubjectId: 3 }],
    });

    const result = await fetchEnrollments();

    expect(mockedApi.get).toHaveBeenCalledWith("/enrollments");
    expect(result).toEqual([{ id: 1, studentId: 2, classSubjectId: 3 }]);
  });

  it("should create enrollment", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createEnrollment(11, 22);

    expect(mockedApi.post).toHaveBeenCalledWith("/enrollments", {
      studentId: 11,
      classSubjectId: 22,
    });
  });

  it("should update enrollment", async () => {
    mockedApi.put.mockResolvedValueOnce({});

    await updateEnrollment(5, 11, 22);

    expect(mockedApi.put).toHaveBeenCalledWith("/enrollments/5", {
      studentId: 11,
      classSubjectId: 22,
    });
  });

  it("should delete enrollment", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteEnrollment(9);

    expect(mockedApi.delete).toHaveBeenCalledWith("/enrollments/9");
  });
});
