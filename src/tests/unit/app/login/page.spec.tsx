import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../../../../app/login/page";
import { api } from "@/lib/api";

const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockLogin = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock("@/lib/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

describe("LoginPage", () => {
  const mockPost = api.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render login form fields and button", () => {
    render(<LoginPage />);

    expect(screen.getByText("EduPresence · IFBA")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /entrar/i }),
    ).toBeInTheDocument();
  });

  it("should remove logout flag and prefetch dashboard on mount", async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    render(<LoginPage />);

    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith("edupresence_logging_out");
      expect(mockPrefetch).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should show validation errors when submitting invalid form", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("Informe um e-mail válido"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("A senha deve ter ao menos 4 caracteres"),
    ).toBeInTheDocument();
  });

  it("should login successfully and redirect to dashboard", async () => {
    const user = userEvent.setup();

    mockPost.mockResolvedValue({
      data: {
        token: "fake-token",
        user: {
          id: 1,
          fullName: "Rebert",
          email: "rebert@ifba.edu.br",
          role: "ADMIN",
        },
      },
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "rebert@ifba.edu.br");
    await user.type(screen.getByLabelText("Senha"), "1234");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "rebert@ifba.edu.br",
        password: "1234",
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        token: "fake-token",
        user: {
          id: 1,
          fullName: "Rebert",
          email: "rebert@ifba.edu.br",
          role: "ADMIN",
        },
      });
    });

    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith("edupresence_logging_out");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should show default auth error when backend returns invalid credentials", async () => {
    const user = userEvent.setup();

    mockPost.mockRejectedValue({
      response: {
        data: {
          message: "Invalid email or password",
        },
      },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "rebert@ifba.edu.br");
    await user.type(screen.getByLabelText("Senha"), "1234");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("E-mail ou senha inválidos."),
    ).toBeInTheDocument();
  });

  it("should show backend message when backend returns a custom string message", async () => {
    const user = userEvent.setup();

    mockPost.mockRejectedValue({
      response: {
        data: {
          message: "Usuário bloqueado temporariamente",
        },
      },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "rebert@ifba.edu.br");
    await user.type(screen.getByLabelText("Senha"), "1234");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("Usuário bloqueado temporariamente"),
    ).toBeInTheDocument();
  });

  it("should show default auth error when request fails without known server message", async () => {
    const user = userEvent.setup();

    mockPost.mockRejectedValue(new Error("Network error"));

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "rebert@ifba.edu.br");
    await user.type(screen.getByLabelText("Senha"), "1234");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("E-mail ou senha inválidos."),
    ).toBeInTheDocument();
  });

  it("should show unexpected auth error when response does not contain token and user", async () => {
    const user = userEvent.setup();

    mockPost.mockResolvedValue({
      data: {},
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "rebert@ifba.edu.br");
    await user.type(screen.getByLabelText("Senha"), "1234");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("Erro inesperado ao autenticar."),
    ).toBeInTheDocument();
  });
});