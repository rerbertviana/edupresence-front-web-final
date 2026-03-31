import { act, renderHook } from "@testing-library/react";
import { useClassSubjectsController } from "@/app/dashboard/class-subjects/controller/useClassSubjectsController";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/text", () => ({
  normalizeText: jest.fn((value: string) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  ),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

jest.mock("@/app/dashboard/class-subjects/domain/messages", () => ({
  translateClassSubjectMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/class-subjects/helpers/helpers", () => ({
  compareClassesBySemesterShiftDesc: jest.fn(() => 0),
  getShiftLabel: jest.fn((shift?: string) => {
    if (shift === "MORNING") return "Manhã";
    if (shift === "AFTERNOON") return "Tarde";
    if (shift === "NIGHT") return "Noite";
    return "—";
  }),
}));

jest.mock("@/app/dashboard/class-subjects/data/service", () => ({
  createClassSubject: jest.fn(),
  updateClassSubject: jest.fn(),
  deleteClassSubject: jest.fn(),
}));

const mockedUseToast = useToast as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;

describe("useClassSubjectsController", () => {
  const showToast = jest.fn();
  const closeToast = jest.fn();
  const setToast = jest.fn();
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseToast.mockReturnValue({
      toast: null,
      showToast,
      closeToast,
      setToast,
    });

    mockedUseMediaQuery.mockReturnValue(true);

    mockedUseQueryClient.mockReturnValue({
      invalidateQueries,
    });

    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    mockedUseMutation.mockImplementation((options) => ({
      mutate: jest.fn(() => {
        if (options?.onSuccess) options.onSuccess();
      }),
      isPending: false,
    }));
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.search).toBe("");
    expect(result.current.selectedLinkId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.classId).toBe("");
    expect(result.current.subjectId).toBe("");
    expect(result.current.teacherId).toBe("");
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.mobileHasSelected).toBe(false);
  });

  it("should update search", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.setSearch("algoritmos");
    });

    expect(result.current.search).toBe("algoritmos");
  });

  it("should open manage on mobile when openManageIfMobile is called", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should not open manage on desktop when openManageIfMobile is called", () => {
    mockedUseMediaQuery.mockReturnValue(true);

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(false);
  });

  it("should reset form when handleNew is called on desktop", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.setSelectedLinkId(10);
      result.current.setFormMode("view");
      result.current.setClassId("1");
      result.current.setSubjectId("2");
      result.current.setTeacherId("3");
      result.current.setLinkToDelete({
        id: 99,
        classId: 1,
        subjectId: 2,
        teacherId: 3,
      } as any);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedLinkId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.classId).toBe("");
    expect(result.current.subjectId).toBe("");
    expect(result.current.teacherId).toBe("");
    expect(result.current.linkToDelete).toBeNull();
  });

  it("should reset form and open manage when handleNew is called on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.classId).toBe("");
    expect(result.current.subjectId).toBe("");
    expect(result.current.teacherId).toBe("");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should return mobileHasSelected as true when there is a selected link", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.setSelectedLinkId(1);
    });

    expect(result.current.mobileHasSelected).toBe(true);
  });

  it("should open smart sheet in create mode when there is no selected link", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.setClassId("10");
      result.current.setSubjectId("20");
      result.current.setTeacherId("30");
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.classId).toBe("");
    expect(result.current.subjectId).toBe("");
    expect(result.current.teacherId).toBe("");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected link", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.setSelectedLinkId(123);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should return class label without shift", () => {
    mockedUseQuery
      .mockReturnValueOnce({
        data: [{ id: 1, name: "Sistemas de Informação" }],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    const label = result.current.getClassLabelNoShift({
      id: 10,
      semester: "2025.1",
      shift: "MORNING",
      courseId: 1,
    } as any);

    expect(label).toBe("2025.1 - Sistemas de Informação");
  });

  it("should return dash in getClassLabelNoShift when class is undefined", () => {
    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.getClassLabelNoShift(undefined)).toBe("—");
  });

  it("should expose filteredLinks from links query when search is empty", () => {
    const mockedLinks = [
      { id: 1, classId: 1, subjectId: 1, teacherId: 1 },
      { id: 2, classId: 2, subjectId: 2, teacherId: 2 },
    ];

    mockedUseQuery
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: mockedLinks,
        isLoading: false,
        isError: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.filteredLinks).toHaveLength(2);
  });

  it("should call create mutation when create is invoked", () => {
    const createMutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({
        mutate: createMutate,
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.create();
    });

    expect(createMutate).toHaveBeenCalled();
  });

  it("should call update mutation when update is invoked", () => {
    const updateMutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: updateMutate,
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.update();
    });

    expect(updateMutate).toHaveBeenCalled();
  });

  it("should call delete mutation when confirmDelete is invoked", () => {
    const deleteMutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: deleteMutate,
        isPending: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    act(() => {
      result.current.confirmDelete();
    });

    expect(deleteMutate).toHaveBeenCalled();
  });

  it("should expose isSaving as true when create mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: true,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving as true when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: true,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting as true when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
      })
      .mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: true,
      });

    const { result } = renderHook(() => useClassSubjectsController());

    expect(result.current.isDeleting).toBe(true);
  });
});
