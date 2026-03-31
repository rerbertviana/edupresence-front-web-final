import { renderHook, act } from "@testing-library/react";
import { useCoursesController } from "@/app/dashboard/courses/controller/useCoursesController";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import { useCoursesQuery } from "@/app/dashboard/courses/data/queries";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/app/dashboard/courses/data/queries", () => ({
  useCoursesQuery: jest.fn(),
  coursesQueryKey: ["courses"],
}));

jest.mock("@/app/dashboard/courses/domain/messages", () => ({
  translateCourseMessage: jest.fn(() => null),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseCoursesQuery = useCoursesQuery as jest.Mock;

describe("useCoursesController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();
  const setToast = jest.fn();

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

    mockedUseCoursesQuery.mockReturnValue({
      data: [
        { id: 1, name: "Sistemas de Informação" },
        { id: 2, name: "Análise e Desenvolvimento de Sistemas" },
      ],
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
    const { result } = renderHook(() => useCoursesController());

    expect(result.current.search).toBe("");
    expect(result.current.selectedCourseId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.name).toBe("");
    expect(result.current.manageOpen).toBe(false);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setSearch("sistemas");
    });

    expect(result.current.search).toBe("sistemas");
  });

  it("should select course and set form mode to view", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setSelectedCourseId(1);
    });

    expect(result.current.selectedCourseId).toBe(1);
    expect(result.current.selectedCourse).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.name).toBe("Sistemas de Informação");
  });

  it("should reset state when handleNew is called", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setSelectedCourseId(1);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedCourseId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.name).toBe("");
    expect(result.current.courseToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should not open manage on desktop", () => {
    mockedUseMediaQuery.mockReturnValue(true);

    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(false);
  });

  it("should open smart sheet in create mode when there is no selected course", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setName("Curso temporário");
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.name).toBe("");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected course", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setSelectedCourseId(1);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should expose filtered courses", () => {
    const { result } = renderHook(() => useCoursesController());

    expect(result.current.filteredCourses).toHaveLength(2);
  });

  it("should expose loading and error states from query", () => {
    mockedUseCoursesQuery.mockReturnValueOnce({
      data: [],
      isLoading: true,
      isError: true,
      error: new Error("Courses error"),
    });

    const { result } = renderHook(() => useCoursesController());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should call create mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useCoursesController());

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

    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.update();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should call delete mutation from confirmDelete", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false });

    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.confirmDelete();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should clear courseToDelete when cancelDelete is called", () => {
    const { result } = renderHook(() => useCoursesController());

    act(() => {
      result.current.setCourseToDelete({
        id: 99,
        name: "Curso X",
      });
    });

    act(() => {
      result.current.cancelDelete();
    });

    expect(result.current.courseToDelete).toBeNull();
  });

  it("should expose isSaving when create mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useCoursesController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useCoursesController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useCoursesController());

    expect(result.current.isDeleting).toBe(true);
  });
});
