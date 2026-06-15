"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GlassCard, SectionBadge, ShellHeader, useLanguage } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/client";

const translations = {
  en: {
    badge: "Create account",
    title: "Create account",
    description: "Save your career profile and keep your DasaAI roadmap synced.",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    submit: "Create account",
    loading: "Creating account...",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    backHome: "Back to home",
    required: "All fields are required.",
    shortName: "Full name must be at least 2 characters.",
    invalidEmail: "Enter a valid email address.",
    shortPassword: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
    emailRegistered: "This email is already registered. Try signing in instead.",
    checkEmail: "Check your inbox to confirm your email before signing in.",
    genericError: "We could not create your account. Please try again.",
  },
  es: {
    badge: "Crear cuenta",
    title: "Crear cuenta",
    description: "Guarda tu perfil profesional y manten tu roadmap de DasaAI sincronizado.",
    fullName: "Nombre completo",
    email: "Correo electronico",
    password: "Contrasena",
    confirmPassword: "Confirmar contrasena",
    submit: "Crear cuenta",
    loading: "Creando cuenta...",
    haveAccount: "Ya tienes cuenta?",
    signIn: "Iniciar sesion",
    backHome: "Volver al inicio",
    required: "Todos los campos son obligatorios.",
    shortName: "El nombre completo debe tener al menos 2 caracteres.",
    invalidEmail: "Ingresa un correo electronico valido.",
    shortPassword: "La contrasena debe tener al menos 8 caracteres.",
    passwordMismatch: "Las contrasenas no coinciden.",
    emailRegistered: "Este correo ya esta registrado. Intenta iniciar sesion.",
    checkEmail: "Revisa tu bandeja de entrada para confirmar tu correo antes de iniciar sesion.",
    genericError: "No pudimos crear tu cuenta. Intentalo de nuevo.",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapSignUpError(message: string, t: (typeof translations)["en"]) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists")) return t.emailRegistered;
  if (normalized.includes("password")) return t.shortPassword;
  return t.genericError;
}

export function RegisterView() {
  const router = useRouter();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError(t.required);
      return;
    }
    if (normalizedName.length < 2) {
      setError(t.shortName);
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError(t.invalidEmail);
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
    setMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
        },
        emailRedirectTo: window.location.origin + "/auth/confirm?next=/profile",
      },
    });

    if (error) {
      setLoading(false);
      setError(mapSignUpError(error.message, t));
      return;
    }

    if (data.user?.identities?.length === 0) {
      setLoading(false);
      setError(t.emailRegistered);
      return;
    }

    if (data.session) {
      router.replace("/profile");
      router.refresh();
      return;
    }

    setLoading(false);
    setMessage(t.checkEmail);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/confirm?next=/profile" },
    });
    if (error) {
      setGoogleLoading(false);
      setError(t.genericError);
    }
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
          <GlassCard className="mx-auto w-full max-w-lg px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
              <SectionBadge>{t.badge}</SectionBadge>
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
              {googleLoading ? t.loading : t.submit}
            </button>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 border-t border-white/50" />
              <span className="text-xs font-medium text-slate-400">o</span>
              <div className="flex-1 border-t border-white/50" />
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}
              <label className="block text-sm font-semibold text-slate-700">
                {t.fullName}
                <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="name" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t.email}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="email" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  {t.password}
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="new-password" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  {t.confirmPassword}
                  <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="new-password" />
                </label>
              </div>
              <button type="submit" disabled={loading} className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:translate-y-0">
                {loading ? t.loading : t.submit}
              </button>
            </form>
            <div className="mt-7 flex flex-col items-center gap-3 text-sm text-slate-600">
              <p>{t.haveAccount} <Link href="/login" className="font-semibold text-[#2563EB] transition hover:text-blue-700">{t.signIn}</Link></p>
              <Link href="/" className="font-medium text-slate-500 underline underline-offset-2 transition hover:text-slate-900">{t.backHome}</Link>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
