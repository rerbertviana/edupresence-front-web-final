import { renderHook, act } from "@testing-library/react";
import { useAttendancesController } from "@/app/dashboard/attendances/controller/useAttendancesController";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("@/contexts/AuthContext");
jest.mock("@tanstack/react-query");

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseQuery = useQuery as jest.Mock;
const mockedUseMutation = useMutation as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;

describe("useAttendancesController", () => {
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: { role: "TEACHER" },
      isAuthenticated: true,
    });

    mockedUseQueryClient.mockReturnValue({
      invalidateQueries,
    });

    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("should enable base when authenticated user is teacher", () => {
    const { result } = renderHook(() => useAttendancesController());

    expect(result.current.enabledBase).toBe(true);
    expect(result.current.isTeacher).toBe(true);
  });

  it("should disable base when user is not teacher", () => {
    mockedUseAuth.mockReturnValueOnce({
      user: { role: "ADMIN" },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAttendancesController());

    expect(result.current.enabledBase).toBe(false);
  });

  it("should show toast when trying to open attendance without selecting lesson", () => {
    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.openAttendance();
    });

    expect(result.current.toast?.message).toContain("Selecione uma aula");
  });

  it("should update class search", () => {
    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.setClassSearch("SI");
    });

    expect(result.current.classSearch).toBe("SI");
  });

  it("should update lesson search", () => {
    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.setLessonSearch("algoritmos");
    });

    expect(result.current.lessonSearch).toBe("algoritmos");
  });

  it("should update attendance search", () => {
    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.setAttendanceSearch("joao");
    });

    expect(result.current.attendanceSearch).toBe("joao");
  });

  it("should call mutation for markPresent", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.markPresent(1);
    });

    expect(mutate).toHaveBeenCalledWith({
      id: 1,
      status: "PRESENT",
    });
  });

  it("should call mutation for markAbsent", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.markAbsent(1);
    });

    expect(mutate).toHaveBeenCalledWith({
      id: 1,
      status: "ABSENT",
    });
  });

  it("should call mutation for markJustified", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false });

    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.markJustified(1);
    });

    expect(mutate).toHaveBeenCalledWith({
      id: 1,
      status: "JUSTIFIED",
    });
  });

  it("should call mutation for bulkPresent", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false });

    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.bulkPresent();
    });

    expect(mutate).toHaveBeenCalledWith("PRESENT");
  });

  it("should call mutation for bulkAbsent", () => {
    const mutate = jest.fn();

    mockedUseMutation
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate: jest.fn(), isPending: false })
      .mockReturnValueOnce({ mutate, isPending: false });

    const { result } = renderHook(() => useAttendancesController());

    act(() => {
      result.current.bulkAbsent();
    });

    expect(mutate).toHaveBeenCalledWith("ABSENT");
  });
});
