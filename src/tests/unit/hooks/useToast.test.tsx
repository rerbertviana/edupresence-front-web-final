import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/hooks/useToast";

describe("useToast", () => {
  it("should initialize with null toast", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toast).toBeNull();
  });

  it("should show a toast with correct type and message", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("success", "Operation successful");
    });

    expect(result.current.toast).toEqual({
      id: 1,
      type: "success",
      message: "Operation successful",
    });
  });

  it("should increment toast id when showing multiple toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("success", "First");
    });

    expect(result.current.toast?.id).toBe(1);

    act(() => {
      result.current.showToast("error", "Second");
    });

    expect(result.current.toast).toEqual({
      id: 2,
      type: "error",
      message: "Second",
    });
  });

  it("should close the toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("success", "Test toast");
    });

    expect(result.current.toast).not.toBeNull();

    act(() => {
      result.current.closeToast();
    });

    expect(result.current.toast).toBeNull();
  });

  it("should allow setting toast directly via setToast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.setToast({
        id: 99,
        type: "error",
        message: "Manual toast",
      });
    });

    expect(result.current.toast).toEqual({
      id: 99,
      type: "error",
      message: "Manual toast",
    });
  });

  it("should overwrite previous toast when showToast is called again", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("success", "First");
    });

    act(() => {
      result.current.showToast("error", "Second");
    });

    expect(result.current.toast).toEqual({
      id: 2,
      type: "error",
      message: "Second",
    });
  });
});
