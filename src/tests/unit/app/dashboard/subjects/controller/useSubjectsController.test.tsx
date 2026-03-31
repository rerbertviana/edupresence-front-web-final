import { renderHook, act } from "@testing-library/react";
import { useSubjectsController } from "@/app/dashboard/subjects/controller/useSubjectsController";

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

jest.mock("@/app/dashboard/subjects/domain/messages", () => ({
  translateSubjectMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/subjects/data/queries", () => ({
  subjectsQueries: {
    subjects: jest.fn(() => ({
      queryKey: ["subjects"],
      queryFn: jest.fn(),
    })),
  },
}));

jest.mock("@/app/dashboard/subjects/helpers/helpers", () => ({
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

describe("useSubjectsController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();

  const subjectsData = [
    {
      id: 10,
      name: "Algoritmos",
      workload: 60,
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

    mockedUseQuery.mockReturnValue({
      data: subjectsData,
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
    const { result } = renderHook(() => useSubjectsController());

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      name: "",
      workload: "",
    });
    expect(result.current.selectedSubjectId).toBeNull();
    expect(result.current.search).toBe("");
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.isLg).toBe(true);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.setSearch("alg");
    });

    expect(result.current.search).toBe("alg");
  });

  it("should expose subjects and filteredSubjects", () => {
    const { result } = renderHook(() => useSubjectsController());

    expect(result.current.subjects).toHaveLength(1);
    expect(result.current.filteredSubjects).toHaveLength(1);
    expect(result.current.filteredSubjects[0].id).toBe(10);
  });

  it("should select subject and set form mode to view", () => {
    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.setSelectedSubjectId(10);
    });

    expect(result.current.selectedSubjectId).toBe(10);
    expect(result.current.selectedSubject).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.formValues).toEqual({
      name: "Algoritmos",
      workload: "60",
    });
  });

  it("should reset form when handleNew is called", () => {
    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.setSelectedSubjectId(10);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedSubjectId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      name: "",
      workload: "",
    });
    expect(result.current.subjectToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in create mode when there is no selected subject", () => {
    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setFormValues({
        name: "Temp",
        workload: "40",
      });
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      name: "",
      workload: "",
    });
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected subject", () => {
    const { result } = renderHook(() => useSubjectsController());

    act(() => {
      result.current.setSelectedSubjectId(10);
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

    const { result } = renderHook(() => useSubjectsController());

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

    const { result } = renderHook(() => useSubjectsController());

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

    const { result } = renderHook(() => useSubjectsController());

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

    const { result } = renderHook(() => useSubjectsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useSubjectsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useSubjectsController());

    expect(result.current.isDeleting).toBe(true);
  });
});
