"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { GlassCard, SectionBadge, ShellHeader, useLanguage } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/client";

const translations = {
  en: {
    badge: "Password recovery",
    title: "Forgot my password",
    description: "Enter your email and we will send recovery instructions if an account exists.",
    email: "Email address",
    submit: "Send recovery link",
    loading: "Sending...",
    message: "If an account exists for this email, you will receive a recovery link shortly.",
    required: "Email address is required.",
    invalidEmail: "Enter a valid email address.",
    genericError: "We could not send the recovery email. Please try again.",
    signIn: "Back to sign in",
  },
  es: {
    badge: "Recuperacion de contrasena",
    title: "Olvide mi contrasena",
    description: "Ingresa tu correo y enviaremos instrucciones si existe una cuenta.",
    email: "Correo electronico",
    submit: "Enviar enlace de recuperacion",
    loading: "Enviando...",
    message: "Si existe una cuenta con este correo, recibiras un enlace de recuperacion pronto.",
    required: "El correo electronico es obligatorio.",
    invalidEmail: "Ingresa un correo electronico valido.",
    genericError: "No pudimos enviar el correo de recuperacion. Intentalo de nuevo.",
    signIn: "Volver a iniciar sesion",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordView() {
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(t.required);
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: window.location.origin + "/reset-password",
    });

    setLoading(false);
    if (error) {
      setError(t.genericError);
      return;
    }

    setMessage(t.message);
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
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}
              <label className="block text-sm font-semibold text-slate-700">
                {t.email}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" autoComplete="email" />
              </label>
              <button type="submit" disabled={loading} className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:translate-y-0">
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
