import { renderHook, act } from "@testing-library/react";
import { usePendingAttendances } from "@/hooks/usePendingAttendances";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe("usePendingAttendances", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mockPendingQuery(data: any[]) {
    mockedUseQuery.mockImplementation(() => ({
      data,
    }));
  }

  it("should return empty defaults when there are no pending attendances", () => {
    mockPendingQuery([]);

    const { result } = renderHook(() =>
      usePendingAttendances({ enabled: true }),
    );

    expect(result.current.pendingAttendances).toEqual([]);
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.animateBell).toBe(false);
  });

  it("should return pending attendances from query", () => {
    const data = [
      {
        id: 1,
        studentId: 10,
        lessonId: 20,
      },
    ];

    mockPendingQuery(data);

    const { result } = renderHook(() =>
      usePendingAttendances({ enabled: true }),
    );

    expect(result.current.pendingAttendances).toEqual(data);
    expect(result.current.pendingCount).toBe(1);
  });

  it("should call useQuery with correct config", () => {
    mockPendingQuery([]);

    renderHook(() => usePendingAttendances({ enabled: true }));

    expect(mockedUseQuery).toHaveBeenCalledWith({
      queryKey: ["pending-attendances"],
      queryFn: expect.any(Function),
      enabled: true,
      refetchInterval: 5000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });
  });

  it("should store initial count on first hydration when pendingCount is greater than zero and storage is zero", () => {
    mockPendingQuery([{ id: 1 }]);

    renderHook(() => usePendingAttendances({ enabled: true }));

    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("1");
  });

  it("should reset stored count to zero on first hydration when pendingCount is zero", () => {
    sessionStorage.setItem("edupresence_pending_last_notified_count", "5");
    mockPendingQuery([]);

    renderHook(() => usePendingAttendances({ enabled: true }));

    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("0");
  });

  it("should trigger bell animation when pending count increases after hydration", () => {
    let currentData = [{ id: 1 }];

    mockedUseQuery.mockImplementation(() => ({
      data: currentData,
    }));

    const { result, rerender } = renderHook(
      ({ enabled }) => usePendingAttendances({ enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    expect(result.current.animateBell).toBe(false);
    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("1");

    currentData = [{ id: 1 }, { id: 2 }];

    rerender({ enabled: true });

    expect(result.current.animateBell).toBe(true);
    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("2");

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(result.current.animateBell).toBe(false);
  });

  it("should not trigger bell animation when pending count does not increase", () => {
    let currentData = [{ id: 1 }];

    mockedUseQuery.mockImplementation(() => ({
      data: currentData,
    }));

    const { result, rerender } = renderHook(
      ({ enabled }) => usePendingAttendances({ enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    currentData = [{ id: 1 }];

    rerender({ enabled: true });

    expect(result.current.animateBell).toBe(false);
  });

  it("should reset stored count when pending count becomes zero after hydration", () => {
    let currentData = [{ id: 1 }, { id: 2 }];

    mockedUseQuery.mockImplementation(() => ({
      data: currentData,
    }));

    const { rerender } = renderHook(
      ({ enabled }) => usePendingAttendances({ enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    currentData = [];

    rerender({ enabled: true });

    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("0");
  });

  it("should initialize last notified count from sessionStorage", () => {
    sessionStorage.setItem("edupresence_pending_last_notified_count", "3");
    mockPendingQuery([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const { result } = renderHook(() =>
      usePendingAttendances({ enabled: true }),
    );

    expect(result.current.pendingCount).toBe(3);
    expect(result.current.animateBell).toBe(false);
  });

  it("should treat invalid stored value as zero", () => {
    sessionStorage.setItem(
      "edupresence_pending_last_notified_count",
      "invalid",
    );
    mockPendingQuery([]);

    renderHook(() => usePendingAttendances({ enabled: true }));

    expect(
      sessionStorage.getItem("edupresence_pending_last_notified_count"),
    ).toBe("0");
  });
});
