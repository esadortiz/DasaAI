"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GlassCard, SectionBadge, ShellHeader, useLanguage } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/security/redirects";

const translations = {
  en: {
    badge: "Authentication",
    title: "Sign in",
    description: "Access your profile, roadmap, and conversations with your AI Career Coach.",
    email: "Email address",
    password: "Password",
    submit: "Sign in",
    loading: "Signing in...",
    google: "Continue with Google",
    googleLoading: "Redirecting to Google...",
    divider: "or",
    forgotPassword: "Forgot my password",
    createAccount: "Create account",
    noAccount: "Don't have an account?",
    backHome: "Back to home",
    required: "All fields are required.",
    invalidEmail: "Enter a valid email address.",
    invalidCredentials: "Invalid email or password.",
    genericError: "We could not sign you in. Please try again.",
  },
  es: {
    badge: "Autenticacion",
    title: "Iniciar sesion",
    description: "Accede a tu perfil, roadmap y conversaciones con tu Coach de Carrera IA.",
    email: "Correo electronico",
    password: "Contrasena",
    submit: "Iniciar sesion",
    loading: "Iniciando sesion...",
    google: "Continuar con Google",
    googleLoading: "Redirigiendo a Google...",
    divider: "o",
    forgotPassword: "Olvide mi contrasena",
    createAccount: "Crear cuenta",
    noAccount: "No tienes cuenta?",
    backHome: "Volver al inicio",
    required: "Todos los campos son obligatorios.",
    invalidEmail: "Ingresa un correo electronico valido.",
    invalidCredentials: "Correo o contrasena incorrectos.",
    genericError: "No pudimos iniciar sesion. Intentalo de nuevo.",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapLoginError(message: string, t: (typeof translations)["en"]) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid") || normalized.includes("credentials")) return t.invalidCredentials;
  return t.genericError;
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = safeInternalPath(searchParams.get("next") ?? searchParams.get("redirectTo"), "/profile");

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const callbackUrl = new URL("/auth/confirm", window.location.origin);
    callbackUrl.searchParams.set("next", redirectTo);
    callbackUrl.searchParams.set("flow", "login");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (error) {
      setGoogleLoading(false);
      setError(mapLoginError(error.message, t));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError(t.required);
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setLoading(false);
      setError(mapLoginError(error.message, t));
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.95),rgba(219,234,254,0)_70%)] blur-2xl" />
        <div className="absolute right-[-7rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.65),rgba(224,231,255,0)_68%)] blur-2xl" />
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} />
        <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
          <GlassCard className="mx-auto w-full max-w-md px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
              <SectionBadge>{t.badge}</SectionBadge>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-xl font-bold text-white shadow-lg shadow-blue-500/20">D</div>
              <h1 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{t.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t.description}</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/70 bg-white/80 text-sm font-semibold text-slate-700 shadow-[0_4px_12px_rgba(37,99,235,0.06)] backdrop-blur-md transition duration-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)] disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? t.googleLoading : t.google}
            </button>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 border-t border-white/50" />
              <span className="text-xs font-medium text-slate-400">{t.divider}</span>
              <div className="flex-1 border-t border-white/50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <label className="block text-sm font-semibold text-slate-700">
                {t.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t.password}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  autoComplete="current-password"
                />
              </label>
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB] transition hover:text-blue-700">
                  {t.forgotPassword}
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? t.loading : t.submit}
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center gap-3 text-sm text-slate-600">
              <p>
                {t.noAccount} <Link href="/register" className="font-semibold text-[#2563EB] transition hover:text-blue-700">{t.createAccount}</Link>
              </p>
              <Link href="/" className="font-medium text-slate-500 underline underline-offset-2 transition hover:text-slate-900">{t.backHome}</Link>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
