import { renderHook, act } from "@testing-library/react";
import { useEnrollmentsController } from "@/app/dashboard/enrollments/controller/useEnrollmentsController";

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

jest.mock("@/app/dashboard/enrollments/domain/messages", () => ({
  translateEnrollmentMessage: jest.fn(() => null),
}));

jest.mock("@/app/dashboard/enrollments/data/queries", () => ({
  enrollmentsQueries: {
    courses: jest.fn(() => ({ queryKey: ["courses"], queryFn: jest.fn() })),
    students: jest.fn((courseId: number | null) => ({
      queryKey: ["students", courseId],
      queryFn: jest.fn(),
    })),
    classSubjects: jest.fn((courseId: number | null) => ({
      queryKey: ["class-subjects", courseId],
      queryFn: jest.fn(),
    })),
    enrollments: jest.fn(() => ({
      queryKey: ["enrollments"],
      queryFn: jest.fn(),
    })),
  },
}));

jest.mock("@/app/dashboard/enrollments/helpers/helpers", () => ({
  getShiftLabel: jest.fn((shift?: string) => {
    if (shift === "MORNING") return "Manhã";
    if (shift === "AFTERNOON") return "Tarde";
    if (shift === "NIGHT") return "Noite";
    return "—";
  }),
  shiftLabels: {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    NIGHT: "Noite",
  },
}));

const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseMediaQuery = useMediaQuery as jest.Mock;

describe("useEnrollmentsController", () => {
  const invalidateQueries = jest.fn();
  const showToast = jest.fn();
  const closeToast = jest.fn();
  const setToast = jest.fn();

  const coursesData = [{ id: 1, name: "Sistemas de Informação" }];

  const studentsData = [
    {
      id: 10,
      registrationNumber: "2025001",
      courseId: 1,
      user: { fullName: "João Silva" },
    },
  ];

  const classSubjectsData = [
    {
      id: 20,
      classId: 2,
      subjectId: 3,
      teacherId: 4,
      class: {
        id: 2,
        courseId: 1,
        semester: "2025.1",
        shift: "MORNING",
        course: { id: 1, name: "Sistemas de Informação" },
      },
      subject: { id: 3, name: "Algoritmos" },
      teacher: { id: 4, user: { fullName: "Professor A" } },
    },
  ];

  const enrollmentsData = [
    {
      id: 30,
      studentId: 10,
      classSubjectId: 20,
      student: {
        id: 10,
        registrationNumber: "2025001",
        courseId: 1,
        user: { fullName: "João Silva" },
      },
      classSubject: {
        id: 20,
        class: {
          id: 2,
          courseId: 1,
          semester: "2025.1",
          shift: "MORNING",
          course: { id: 1, name: "Sistemas de Informação" },
        },
        subject: { id: 3, name: "Algoritmos" },
        teacher: { id: 4, user: { fullName: "Professor A" } },
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

      if (key.includes('"class-subjects"')) {
        return {
          data: classSubjectsData,
          isLoading: false,
          isError: false,
          error: null,
        };
      }

      if (key.includes('"enrollments"')) {
        return {
          data: enrollmentsData,
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
    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.search).toBe("");
    expect(result.current.selectedEnrollmentId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      courseId: "",
      studentId: "",
      classSubjectId: "",
    });
    expect(result.current.manageOpen).toBe(false);
    expect(result.current.isLg).toBe(true);
  });

  it("should update search value", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setSearch("joao");
    });

    expect(result.current.search).toBe("joao");
  });

  it("should expose query data arrays", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.courses).toHaveLength(1);
    expect(result.current.students).toHaveLength(1);
    expect(result.current.classSubjects).toHaveLength(1);
    expect(result.current.enrollments).toHaveLength(1);
  });

  it("should select enrollment and set form mode to view", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setSelectedEnrollmentId(30);
    });

    expect(result.current.selectedEnrollmentId).toBe(30);
    expect(result.current.selectedEnrollment).not.toBeNull();
    expect(result.current.formMode).toBe("view");
    expect(result.current.formValues).toEqual({
      courseId: "1",
      studentId: "10",
      classSubjectId: "20",
    });
  });

  it("should expose selectedStudent and selectedClassSubject based on form values", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setFormValues({
        courseId: "1",
        studentId: "10",
        classSubjectId: "20",
      });
    });

    expect(result.current.selectedStudent?.id).toBe(10);
    expect(result.current.selectedClassSubject?.id).toBe(20);
  });

  it("should expose filteredClassSubjects based on selected course", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setFormValues({
        courseId: "1",
        studentId: "",
        classSubjectId: "",
      });
    });

    expect(result.current.filteredClassSubjects).toHaveLength(1);
    expect(result.current.filteredClassSubjects[0].id).toBe(20);
  });

  it("should reset form when handleNew is called", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setSelectedEnrollmentId(30);
    });

    act(() => {
      result.current.handleNew();
    });

    expect(result.current.selectedEnrollmentId).toBeNull();
    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      courseId: "",
      studentId: "",
      classSubjectId: "",
    });
    expect(result.current.enrollmentToDelete).toBeNull();
  });

  it("should open manage on mobile", () => {
    mockedUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.openManageIfMobile();
    });

    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in create mode when there is no selected enrollment", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setFormMode("edit");
      result.current.setFormValues({
        courseId: "1",
        studentId: "10",
        classSubjectId: "20",
      });
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("create");
    expect(result.current.formValues).toEqual({
      courseId: "",
      studentId: "",
      classSubjectId: "",
    });
    expect(result.current.manageOpen).toBe(true);
  });

  it("should open smart sheet in view mode when there is a selected enrollment", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    act(() => {
      result.current.setSelectedEnrollmentId(30);
    });

    act(() => {
      result.current.openSmartSheet();
    });

    expect(result.current.formMode).toBe("view");
    expect(result.current.manageOpen).toBe(true);
    expect(result.current.mobileHasSelected).toBe(true);
  });

  it("should expose filteredEnrollments", () => {
    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.filteredEnrollments).toHaveLength(1);
    expect(result.current.filteredEnrollments[0].id).toBe(30);
  });

  it("should call create mutation", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useEnrollmentsController());

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

    const { result } = renderHook(() => useEnrollmentsController());

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

    const { result } = renderHook(() => useEnrollmentsController());

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

    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isSaving when update mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.isSaving).toBe(true);
  });

  it("should expose isDeleting when delete mutation is pending", () => {
    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: true });

    const { result } = renderHook(() => useEnrollmentsController());

    expect(result.current.isDeleting).toBe(true);
  });
});
