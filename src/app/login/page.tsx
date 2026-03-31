"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(4, "A senha deve ter ao menos 4 caracteres"),
});

type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

const LOGOUT_FLAG_KEY = "edupresence_logging_out";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const defaultAuthError = "E-mail ou senha inválidos.";

  const [isRouting, startTransition] = useTransition();

  useEffect(() => {
    try {
      window.localStorage.removeItem(LOGOUT_FLAG_KEY);
    } catch {}

    router.prefetch("/dashboard");
  }, [router]);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const isSubmitting = formState.isSubmitting || isRouting;

  async function onSubmit(values: FormValues) {
    try {
      setError(null);

      const response = await api.post<LoginResponse>("/auth/login", values);

      if (response.data?.token && response.data?.user) {
        try {
          window.localStorage.removeItem(LOGOUT_FLAG_KEY);
        } catch {}

        login({
          token: response.data.token,
          user: response.data.user,
        });

        startTransition(() => {
          router.replace("/dashboard");
        });

        return;
      }

      setError("Erro inesperado ao autenticar.");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;

      if (serverMessage === "Invalid email or password") {
        setError(defaultAuthError);
        return;
      }

      if (typeof serverMessage === "string") {
        setError(serverMessage);
        return;
      }

      setError(defaultAuthError);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg/login-bg.png')" }}
      />

      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="relative w-full max-w-md rounded-3xl border-4 bg-slate-950/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          {isSubmitting && (
            <div
              className="absolute inset-0 z-20 rounded-3xl cursor-default"
              aria-hidden="true"
            />
          )}

          <div className="w-16 h-16 rounded-2xl bg-[#00923F] mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-900/60">
            EP
          </div>

          <h1 className="text-center text-xl font-semibold text-slate-50 mt-4">
            EduPresence · IFBA
          </h1>
          <p className="text-center text-sm text-slate-400 mb-6">
            Acesse o painel interno
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-200"
              >
                E-mail
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@ifba.edu.br"
                  {...register("email")}
                  className="pl-10"
                />
              </div>
              {formState.errors.email && (
                <p className="text-xs text-red-400 mt-1">
                  {formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-200"
              >
                Senha
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10"
                />
              </div>
              {formState.errors.password && (
                <p className="text-xs text-red-400 mt-1">
                  {formState.errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-center text-xs text-white bg-red-400 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className={cn("w-full mt-2", "disabled:opacity-100")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            O acesso é restrito a usuários autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
