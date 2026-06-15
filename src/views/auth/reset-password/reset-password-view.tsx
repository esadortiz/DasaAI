"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { GlassCard, SectionBadge, ShellHeader, useLanguage } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/client";

const translations = {
  en: {
    badge: "Password reset",
    title: "New password",
    description: "Choose a new password for your DasaAI account.",
    password: "New password",
    confirmPassword: "Confirm new password",
    submit: "Update password",
    loading: "Updating...",
    preparing: "Preparing secure session...",
    required: "All fields are required.",
    shortPassword: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
    sessionExpired: "Your recovery session expired. Request a new link.",
    genericError: "We could not update your password. Please try again.",
    signIn: "Back to sign in",
  },
  es: {
    badge: "Restablecer contrasena",
    title: "Nueva contrasena",
    description: "Elige una nueva contrasena para tu cuenta de DasaAI.",
    password: "Nueva contrasena",
    confirmPassword: "Confirmar nueva contrasena",
    submit: "Actualizar contrasena",
    loading: "Actualizando...",
    preparing: "Preparando sesion segura...",
    required: "Todos los campos son obligatorios.",
    shortPassword: "La contrasena debe tener al menos 8 caracteres.",
    passwordMismatch: "Las contrasenas no coinciden.",
    sessionExpired: "Tu sesion de recuperacion expiro. Solicita un enlace nuevo.",
    genericError: "No pudimos actualizar tu contrasena. Intentalo de nuevo.",
    signIn: "Volver a iniciar sesion",
  },
};

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function prepareSession() {
      const supabase = createClient();
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setError(t.sessionExpired);
          setSessionReady(false);
          setCheckingSession(false);
          return;
        }
        router.replace("/reset-password");
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        setError(t.sessionExpired);
        setSessionReady(false);
      } else {
        setSessionReady(true);
      }
      setCheckingSession(false);
    }

    prepareSession();
    return () => {
      active = false;
    };
  }, [router, searchParams, t.sessionExpired]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionReady) {
      setError(t.sessionExpired);
      return;
    }

    if (!password || !confirmPassword) {
      setError(t.required);
      return;
    }
    if (password.length < 8) {
      setError(t.shortPassword);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setError(error.message.toLowerCase().includes("session") ? t.sessionExpired : t.genericError);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
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
              <h1 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{t.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t.description}</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {checkingSession && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{t.preparing}</div>}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <label className="block text-sm font-semibold text-slate-700">
                {t.password}
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="new-password" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t.confirmPassword}
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="new-password" />
              </label>
              <button type="submit" disabled={loading || checkingSession || !sessionReady} className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:translate-y-0">
                {loading ? t.loading : t.submit}
              </button>
            </form>
            <div className="mt-7 text-center">
              <Link href="/login" className="text-sm font-semibold text-[#2563EB] transition hover:text-blue-700">{t.signIn}</Link>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
