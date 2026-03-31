import { renderHook } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  function createMatchMedia(matches: boolean) {
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();

    const matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    return {
      matchMedia,
      addEventListener,
      removeEventListener,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when media query matches", () => {
    const { matchMedia } = createMatchMedia(true);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMedia,
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
    expect(result.current).toBe(true);
  });

  it("should return false when media query does not match", () => {
    const { matchMedia } = createMatchMedia(false);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMedia,
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(result.current).toBe(false);
  });

  it("should subscribe to media query change event", () => {
    const { matchMedia, addEventListener } = createMatchMedia(true);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMedia,
    });

    renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should unsubscribe from media query change event on unmount", () => {
    const { matchMedia, removeEventListener } = createMatchMedia(true);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMedia,
    });

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should re-run when query changes", () => {
    const { matchMedia } = createMatchMedia(true);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMedia,
    });

    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 768px)" },
    });

    rerender({ query: "(min-width: 1024px)" });

    expect(window.matchMedia).toHaveBeenNthCalledWith(1, "(min-width: 768px)");
    expect(window.matchMedia).toHaveBeenNthCalledWith(2, "(min-width: 1024px)");
  });
});
