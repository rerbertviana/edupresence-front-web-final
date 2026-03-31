import {
  fetchCourses,
  fetchStudents,
  createStudentFlow,
  updateStudentFlow,
  deleteStudent,
} from "@/app/dashboard/students/data/service";

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

describe("students service", () => {
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

  it("should fetch students", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, registrationNumber: "2025001" }],
    });

    const result = await fetchStudents();

    expect(mockedApi.get).toHaveBeenCalledWith("/students");
    expect(result).toEqual([{ id: 1, registrationNumber: "2025001" }]);
  });

  it("should create student flow and return created user id", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        user: { id: 99 },
        student: { id: 10 },
      },
    });

    const result = await createStudentFlow({
      fullName: "João Silva",
      email: "joao@email.com",
      password: "123456",
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      "/students/register-with-user",
      {
        fullName: "João Silva",
        email: "joao@email.com",
        password: "123456",
        registrationNumber: "2025001",
        courseId: 1,
        currentSemester: 2,
      },
    );

    expect(result).toBe(99);
  });

  it("should update student flow with password when provided", async () => {
    mockedApi.put.mockResolvedValue({});

    await updateStudentFlow({
      studentId: 10,
      userId: 20,
      fullName: "João Silva",
      email: "joao@email.com",
      password: "nova-senha",
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(1, "/users/20", {
      fullName: "João Silva",
      email: "joao@email.com",
      role: "STUDENT",
      password: "nova-senha",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(2, "/students/10", {
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
    });
  });

  it("should update student flow without password when it is empty", async () => {
    mockedApi.put.mockResolvedValue({});

    await updateStudentFlow({
      studentId: 10,
      userId: 20,
      fullName: "João Silva",
      email: "joao@email.com",
      password: "   ",
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(1, "/users/20", {
      fullName: "João Silva",
      email: "joao@email.com",
      role: "STUDENT",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(2, "/students/10", {
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
    });
  });

  it("should delete student", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteStudent(10);

    expect(mockedApi.delete).toHaveBeenCalledWith("/students/10");
  });
});
