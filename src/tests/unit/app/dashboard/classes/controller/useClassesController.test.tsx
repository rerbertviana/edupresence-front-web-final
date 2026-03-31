import { renderHook, act } from "@testing-library/react";
import { useClassesController } from "@/app/dashboard/classes/controller/useClassesController";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";

import {
  useCoursesQuery,
  useClassesQuery,
} from "@/app/dashboard/classes/data/queries";

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

jest.mock("@/app/dashboard/classes/data/queries", () => ({
  useCoursesQuery: jest.fn(),
  useClassesQuery: jest.fn(),
  classesQueryKey: ["classes"],
}));

jest.mock("@/lib/text", () => ({
  normalizeText: jest.fn((value: string) => (value ?? "").toLowerCase()),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

jest.mock("@/app/dashboard/classes/domain/messages", () => ({
  translateClassMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/classes/helpers/helpers", () => ({
  buildYears: jest.fn(() => [2026, 2025, 2024]),
  compareClassesBySemesterDesc: jest.fn(() => 0),
  shiftLabel: jest.fn((shift: string) => shift),
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseCoursesQuery = useCoursesQuery as jest.Mock;
const mockedUseClassesQuery = useClassesQuery as jest.Mock;

describe("useClassesController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();

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

    mockedUseCoursesQuery.mockReturnValue({
      data: [
        { id: 1, name: "Sistemas de Informação" },
        { id: 2, name: "ADS" },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    mockedUseClassesQuery.mockReturnValue({
      data: [
        {
          id: 1,
          courseId: 1,
          semester: "2025.1",
          shift: "MORNING",
        },
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

  it("should initialize with default exposed state", () => {
    const { result } = renderHook(() => useClassesController());

    expect(result.current.search).toBe("");
    expect(result.current.formMode).toBe("create");
    expect(result.current.selectedClassId).toBeNull();
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.isLg).toBe(true);
    expect(result.current.years).toEqual([2026, 2025, 2024]);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.setSearch("si");
    });

    expect(result.current.search).toBe("si");
  });

  it("should select a class and set form mode to view", () => {
    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.setSelectedClassId(1);
    });

    expect(result.current.selectedClassId).toBe(1);
    expect(result.current.selectedClass).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.formValues).toEqual({
      courseId: "1",
      year: "2025",
      period: "1",
      semester: "2025.1",
      shift: "MORNING",
    });
  });

  it("should reset form when handleNew is called", () => {
    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.setSelectedClassId(1);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedClassId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      courseId: "",
      year: "",
      period: "",
      semester: "",
      shift: "",
    });
    expect(result.current.classToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should not open manage on desktop", () => {
    mockedUseMediaQuery.mockReturnValue(true);

    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(false);
  });

  it("should open smart sheet in create mode when there is no selected class", () => {
    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setFormValues({
        courseId: "1",
        year: "2025",
        period: "1",
        semester: "2025.1",
        shift: "MORNING",
      });
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      courseId: "",
      year: "",
      period: "",
      semester: "",
      shift: "",
    });
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected class", () => {
    const { result } = renderHook(() => useClassesController());

    act(() => {
      result.current.setSelectedClassId(1);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should expose filteredClasses", () => {
    const { result } = renderHook(() => useClassesController());

    expect(result.current.filteredClasses).toHaveLength(1);
    expect(result.current.filteredClasses[0].id).toBe(1);
  });

  it("should expose loading and error states from queries", () => {
    mockedUseCoursesQuery.mockReturnValueOnce({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });

    mockedUseClassesQuery.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error("Classes error"),
    });

    const { result } = renderHook(() => useClassesController());

    expect(result.current.isLoadingCourses).toBe(true);
    expect(result.current.isClassesError).toBe(true);
    expect(result.current.classesError).toBeInstanceOf(Error);
  });

  it("should call create mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useClassesController());

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

    const { result } = renderHook(() => useClassesController());

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

    const { result } = renderHook(() => useClassesController());

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

    const { result } = renderHook(() => useClassesController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useClassesController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useClassesController());

    expect(result.current.isDeleting).toBe(true);
  });
});
