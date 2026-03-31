import { renderHook, act } from "@testing-library/react";
import { useLessonsController } from "@/app/dashboard/lessons/controller/useLessonsController";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import {
  useLessonsByClassSubjectQuery,
  useTeacherClassSubjectsQuery,
} from "@/app/dashboard/lessons/data/queries";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/lib/httpErrors", () => ({
  parseBackendMessage: jest.fn(() => "Mocked backend error"),
}));

jest.mock("@/app/dashboard/lessons/domain/messages", () => ({
  translateLessonMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/lessons/data/queries", () => ({
  lessonsByClassSubjectQueryKey: jest.fn(
    (classSubjectId: number | null, all: boolean) => [
      "lessons",
      "by-class-subject",
      classSubjectId,
      all,
    ],
  ),
  useTeacherClassSubjectsQuery: jest.fn(),
  useLessonsByClassSubjectQuery: jest.fn(),
}));

jest.mock("@/app/dashboard/lessons/helpers/helpers", () => ({
  compareClassSubjectsBySemesterDesc: jest.fn(() => 0),
  formatDateBR: jest.fn((value: string) => value),
  formatTimeBR: jest.fn((value: string) => value),
  maskHHMM: jest.fn((value: string) => value),
  normalizeText: jest.fn((value: string) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim(),
  ),
  parseISODateToLocalDate: jest.fn(() => new Date(2026, 2, 8)),
  timeInputValueFromISO: jest.fn((value: string) => value?.slice(11, 16) ?? ""),
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseTeacherClassSubjectsQuery =
  useTeacherClassSubjectsQuery as jest.Mock;
const mockedUseLessonsByClassSubjectQuery =
  useLessonsByClassSubjectQuery as jest.Mock;

describe("useLessonsController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();
  const setToast = jest.fn();

  const classSubjectsData = [
    {
      id: 1,
      class: {
        id: 10,
        semester: "2025.1",
        shift: "MORNING",
        course: { id: 100, name: "Sistemas de Informação" },
      },
      subject: { id: 200, name: "Algoritmos" },
      teacher: { id: 300, user: { fullName: "Professor A" } },
    },
  ];

  const lessonsData = [
    {
      id: 20,
      classSubjectId: 1,
      date: "2026-03-08",
      startTime: "2026-03-08T08:00:00.000Z",
      endTime: "2026-03-08T10:00:00.000Z",
      status: "OPEN",
      classSubject: {
        subject: { name: "Algoritmos" },
        class: {
          course: { name: "Sistemas de Informação" },
          semester: "2025.1",
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseQueryClient.mockReturnValue({
      invalidateQueries,
    });

    mockedUseMediaQuery.mockReturnValue(true);

    mockedUseAuth.mockReturnValue({
      user: { role: "TEACHER" },
      isAuthenticated: true,
    });

    mockedUseToast.mockReturnValue({
      toast: null,
      showToast,
      closeToast,
      setToast,
    });

    mockedUseTeacherClassSubjectsQuery.mockReturnValue({
      data: classSubjectsData,
      isLoading: false,
      isError: false,
      error: null,
    });

    mockedUseLessonsByClassSubjectQuery.mockReturnValue({
      data: lessonsData,
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
    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isTeacher).toBe(true);
    expect(result.current.enabledBase).toBe(true);
    expect(result.current.classSearch).toBe("");
    expect(result.current.lessonSearch).toBe("");
    expect(result.current.selectedClassSubjectId).toBeNull();
    expect(result.current.selectedLessonId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.date).toBe("");
    expect(result.current.startTime).toBe("");
    expect(result.current.endTime).toBe("");
    expect(result.current.manageOpen).toBe(false);
  });

  it("should disable base when user is not teacher", () => {
    mockedUseAuth.mockReturnValueOnce({
      user: { role: "ADMIN" },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isTeacher).toBe(false);
    expect(result.current.enabledBase).toBe(false);
  });

  it("should update search fields", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setClassSearch("si");
      result.current.setLessonSearch("alg");
    });

    expect(result.current.classSearch).toBe("si");
    expect(result.current.lessonSearch).toBe("alg");
  });

  it("should select class subject", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedClassSubjectId(1);
    });

    expect(result.current.selectedClassSubjectId).toBe(1);
    expect(result.current.selectedClassSubject?.id).toBe(1);
  });

  it("should reset lesson state when class subject changes", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedLessonId(20);
      result.current.setLessonSearch("teste");
      result.current.setSelectedClassSubjectId(1);
    });

    expect(result.current.selectedLessonId).toBeNull();
    expect(result.current.lessonSearch).toBe("");
    expect(result.current.formMode).toBe("create");
  });

  it("should select lesson and load form values", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedLessonId(20);
    });

    expect(result.current.selectedLessonId).toBe(20);
    expect(result.current.selectedLesson?.id).toBe(20);
    expect(result.current.formMode).toBe("view");
    expect(result.current.date).toBe("2026-03-08");
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should reset form in handleNew", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedLessonId(20);
      result.current.handleNew();
    });

    expect(result.current.selectedLessonId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.date).toBe("");
    expect(result.current.startTime).toBe("");
    expect(result.current.endTime).toBe("");
    expect(result.current.lessonToDelete).toBeNull();
  });

  it("should show info toast when openSmartSheet is called without selected class subject", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.openSmartSheet();
    });

    expect(showToast).toHaveBeenCalledWith(
      "info",
      "Selecione uma turma primeiro.",
    );
  });

  it("should open smart sheet in create mode when no lesson is selected", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedClassSubjectId(1);
    });

    act(() => {
      result.current.setFormMode("edit");
      result.current.setDate("2026-03-08");
      result.current.setStartTime("08:00");
      result.current.setEndTime("10:00");
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.date).toBe("");
    expect(result.current.startTime).toBe("");
    expect(result.current.endTime).toBe("");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when a lesson is selected", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedClassSubjectId(1);
    });

    act(() => {
      result.current.setSelectedLessonId(20);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
  });

  it("should call status mutation when toggleLessonStatus is triggered", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.toggleLessonStatus(lessonsData[0] as any, false);
    });

    expect(mutate).toHaveBeenCalledWith({
      lesson: lessonsData[0],
      nextStatus: "CLOSED",
    });
  });

  it("should not toggle lesson status when status mutation is pending", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.toggleLessonStatus(lessonsData[0] as any, true);
    });

    expect(mutate).not.toHaveBeenCalled();
  });

  it("should set lessonToDelete from selected lesson", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setSelectedLessonId(20);
    });

    act(() => {
      result.current.askDeleteFromSelected();
    });

    expect(result.current.lessonToDelete?.id).toBe(20);
  });

  it("should clear lessonToDelete when cancelDelete is called", () => {
    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.setLessonToDelete(lessonsData[0] as any);
    });

    act(() => {
      result.current.cancelDelete();
    });

    expect(result.current.lessonToDelete).toBeNull();
  });

  it("should call create mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.create();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should call update mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

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
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false });

    const { result } = renderHook(() => useLessonsController());

    act(() => {
      result.current.confirmDelete();
    });

    expect(mutate).toHaveBeenCalled();
  });

  it("should expose isSaving when create mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isDeleting).toBe(true);
  });

  it("should expose isTogglingStatus when status mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useLessonsController());

    expect(result.current.isTogglingStatus).toBe(true);
  });
});
