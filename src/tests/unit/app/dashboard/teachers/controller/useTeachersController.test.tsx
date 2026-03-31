import { renderHook, act } from "@testing-library/react";
import { useTeachersController } from "@/app/dashboard/teachers/controller/useTeachersController";

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

jest.mock("@/lib/text", () => ({
  normalizeText: jest.fn((value: string) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim(),
  ),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

jest.mock("@/app/dashboard/teachers/domain/messages", () => ({
  translateTeacherMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/teachers/data/queries", () => ({
  teachersKeys: {
    teachers: ["teachers"],
  },
  teachersQueries: {
    teachers: jest.fn(() => ({
      queryKey: ["teachers"],
      queryFn: jest.fn(),
    })),
  },
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;

describe("useTeachersController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();
  const setToast = jest.fn();

  const teachersData = [
    {
      id: 10,
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
      user: {
        id: 100,
        fullName: "Professor A",
        email: "prof@email.com",
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
      setToast,
    });

    mockedUseQueryClient.mockReturnValue({
      invalidateQueries,
    });

    mockedUseQuery.mockReturnValue({
      data: teachersData,
      isLoading: false,
      isError: false,
      error: null,
    });

    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTeachersController());

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      fullName: "",
      email: "",
      password: "",
      siapeCode: "",
      teachingArea: "",
    });
    expect(result.current.selectedTeacherId).toBeNull();
    expect(result.current.search).toBe("");
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.isLg).toBe(true);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.setSearch("prof");
    });

    expect(result.current.search).toBe("prof");
  });

  it("should expose filteredTeachers", () => {
    const { result } = renderHook(() => useTeachersController());

    expect(result.current.filteredTeachers).toHaveLength(1);
    expect(result.current.filteredTeachers[0].id).toBe(10);
  });

  it("should select teacher and set form mode to view", () => {
    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.setSelectedTeacherId(10);
    });

    expect(result.current.selectedTeacherId).toBe(10);
    expect(result.current.selectedTeacher).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.formValues).toEqual({
      fullName: "Professor A",
      email: "prof@email.com",
      password: "",
      siapeCode: "SIAPE123",
      teachingArea: "Computação",
    });
  });

  it("should reset form when handleNew is called", () => {
    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.setSelectedTeacherId(10);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedTeacherId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      fullName: "",
      email: "",
      password: "",
      siapeCode: "",
      teachingArea: "",
    });
    expect(result.current.teacherToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in create mode when there is no selected teacher", () => {
    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setFormValues({
        fullName: "Temp",
        email: "temp@email.com",
        password: "123",
        siapeCode: "SIAPE999",
        teachingArea: "Área Temp",
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
      siapeCode: "",
      teachingArea: "",
    });
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected teacher", () => {
    const { result } = renderHook(() => useTeachersController());

    act(() => {
      result.current.setSelectedTeacherId(10);
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

    const { result } = renderHook(() => useTeachersController());

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

    const { result } = renderHook(() => useTeachersController());

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

    const { result } = renderHook(() => useTeachersController());

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

    const { result } = renderHook(() => useTeachersController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useTeachersController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useTeachersController());

    expect(result.current.isDeleting).toBe(true);
  });
});
