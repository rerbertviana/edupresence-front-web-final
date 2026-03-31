import {
  fetchTeachers,
  createTeacherFlow,
  updateTeacherFlow,
  deleteTeacher,
} from "@/app/dashboard/teachers/data/service";

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

describe("teachers service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch teachers", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, siapeCode: "12345" }],
    });

    const result = await fetchTeachers();

    expect(mockedApi.get).toHaveBeenCalledWith("/teachers");
    expect(result).toEqual([{ id: 1, siapeCode: "12345" }]);
  });

  it("should create teacher flow", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await createTeacherFlow({
      fullName: "Professor A",
      email: "prof@email.com",
      password: "123456",
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      "/teachers/register-with-user",
      {
        fullName: "Professor A",
        email: "prof@email.com",
        password: "123456",
        siapeCode: "SIAPE123",
        teachingArea: "Computação",
      },
    );
  });

  it("should update teacher flow with password when provided", async () => {
    mockedApi.put.mockResolvedValue({});

    await updateTeacherFlow({
      teacherId: 10,
      userId: 20,
      fullName: "Professor A",
      email: "prof@email.com",
      password: "nova-senha",
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(1, "/users/20", {
      fullName: "Professor A",
      email: "prof@email.com",
      role: "TEACHER",
      password: "nova-senha",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(2, "/teachers/10", {
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });
  });

  it("should update teacher flow without password when it is empty", async () => {
    mockedApi.put.mockResolvedValue({});

    await updateTeacherFlow({
      teacherId: 10,
      userId: 20,
      fullName: "Professor A",
      email: "prof@email.com",
      password: "   ",
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(1, "/users/20", {
      fullName: "Professor A",
      email: "prof@email.com",
      role: "TEACHER",
    });

    expect(mockedApi.put).toHaveBeenNthCalledWith(2, "/teachers/10", {
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });
  });

  it("should delete teacher", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await deleteTeacher(10);

    expect(mockedApi.delete).toHaveBeenCalledWith("/teachers/10");
  });
});
