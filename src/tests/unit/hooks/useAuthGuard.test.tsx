import { renderHook, waitFor } from "@testing-library/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedUsePathname = usePathname as jest.Mock;

describe("useAuthGuard", () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockedUseRouter.mockReturnValue({
      replace,
    });

    mockedUsePathname.mockReturnValue("/dashboard");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "ADMIN" },
    });
  });

  it("should allow access to /dashboard", async () => {
    mockedUsePathname.mockReturnValue("/dashboard");

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(true);
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("should redirect to /login when user is not authenticated and no storage exists", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    mockedUsePathname.mockReturnValue("/dashboard/classes");

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("should redirect to /login when logout flag is set", async () => {
    localStorage.setItem("edupresence_logging_out", "1");

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("should keep checked false when auth exists in storage but user is still null", async () => {
    localStorage.setItem("edupresence_auth", "mocked-auth");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("should allow teacher access to attendances route", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/attendances");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "TEACHER" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(true);
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("should allow teacher access to lessons route", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/lessons");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "TEACHER" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(true);
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("should redirect non-teacher from attendances route to /dashboard", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/attendances");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "ADMIN" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("should redirect non-teacher from lessons route to /dashboard", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/lessons");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "ADMIN" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("should allow admin access to generic dashboard routes", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/students");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "ADMIN" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(true);
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("should redirect non-admin from generic dashboard routes to /dashboard", async () => {
    mockedUsePathname.mockReturnValue("/dashboard/students");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "TEACHER" },
    });

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("should allow non-dashboard routes", async () => {
    mockedUsePathname.mockReturnValue("/login");

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    localStorage.setItem("edupresence_auth", "mocked-auth");

    const { result } = renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(result.current.checked).toBe(false);
    });
  });
});
