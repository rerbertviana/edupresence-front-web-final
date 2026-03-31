import { renderHook, act } from "@testing-library/react";
import { useStudentsController } from "@/app/dashboard/students/controller/useStudentsController";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

jest.mock("@/app/dashboard/students/domain/messages", () => ({
  translateStudentMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/students/data/queries", () => ({
  studentsQueries: {
    courses: jest.fn(() => ({
      queryKey: ["courses"],
      queryFn: jest.fn(),
    })),
    students: jest.fn(() => ({
      queryKey: ["students"],
      queryFn: jest.fn(),
    })),
  },
}));

jest.mock("@/app/dashboard/students/helpers/helpers", () => ({
  normalizeText: jest.fn((value: string) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim(),
  ),
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;

describe("useStudentsController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();

  const coursesData = [
    { id: 1, name: "Sistemas de Informação" },
    { id: 2, name: "ADS" },
  ];

  const studentsData = [
    {
      id: 10,
      registrationNumber: "2025001",
      courseId: 1,
      currentSemester: 2,
      user: {
        id: 100,
        fullName: "João Silva",
        email: "joao@email.com",
      },
      course: {
        id: 1,
        name: "Sistemas de Informação",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseMediaQuery.mockReturnValue(true);

    mockedUseToast.mockReturnValue({
      toast: null,
      showToast,
      closeToast,
    });

    mockedUseQueryClient.mockReturnValue({
      invalidateQueries,
    });

    mockedUseQuery.mockImplementation((config: any) => {
      const key = JSON.stringify(config?.queryKey ?? []);

      if (key.includes('"courses"')) {
        return {
          data: coursesData,
          isLoading: false,
          isError: false,
          error: null,
        };
      }

      if (key.includes('"students"')) {
        return {
          data: studentsData,
          isLoading: false,
          isError: false,
          error: null,
        };
      }

      return {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      };
    });

    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useStudentsController());

    expect(result.current.search).toBe("");
    expect(result.current.selectedStudentId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      fullName: "",
      email: "",
      password: "",
      registrationNumber: "",
      courseId: "",
      currentSemester: "",
    });
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.isLg).toBe(true);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.setSearch("joao");
    });

    expect(result.current.search).toBe("joao");
  });

  it("should expose courses and students arrays", () => {
    const { result } = renderHook(() => useStudentsController());

    expect(result.current.courses).toHaveLength(2);
    expect(result.current.students).toHaveLength(1);
  });

  it("should expose filteredStudents", () => {
    const { result } = renderHook(() => useStudentsController());

    expect(result.current.filteredStudents).toHaveLength(1);
    expect(result.current.filteredStudents[0].id).toBe(10);
  });

  it("should select student and set form mode to view", () => {
    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.setSelectedStudentId(10);
    });

    expect(result.current.selectedStudentId).toBe(10);
    expect(result.current.selectedStudent).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.formValues).toEqual({
      fullName: "João Silva",
      email: "joao@email.com",
      password: "",
      registrationNumber: "2025001",
      courseId: "1",
      currentSemester: "2",
    });
  });

  it("should reset form when handleNew is called", () => {
    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.setSelectedStudentId(10);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedStudentId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      fullName: "",
      email: "",
      password: "",
      registrationNumber: "",
      courseId: "",
      currentSemester: "",
    });
    expect(result.current.studentToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in create mode when there is no selected student", () => {
    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setFormValues({
        fullName: "Temp",
        email: "temp@email.com",
        password: "123",
        registrationNumber: "123",
        courseId: "1",
        currentSemester: "1",
      });
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      fullName: "",
      email: "",
      password: "",
      registrationNumber: "",
      courseId: "",
      currentSemester: "",
    });
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected student", () => {
    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.setSelectedStudentId(10);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
    expect(result.current.mobileHasSelected).toBe(true);
  });

  it("should call create mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.create();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should call update mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.update();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should call delete mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false });

    const { result } = renderHook(() => useStudentsController());

    act(() => {
      result.current.confirmDelete();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should expose isSaving when create mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useStudentsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useStudentsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useStudentsController());

    expect(result.current.isDeleting).toBe(true);
  });
});
