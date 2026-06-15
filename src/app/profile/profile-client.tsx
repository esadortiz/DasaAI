"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard, SectionBadge, ShellHeader, BottomNav, SkeletonBlock, useLanguage } from "../../components/site-shell";
import { createClient } from "../../lib/supabase/client";
import { apiFetch } from "@/lib/api/api-fetch";

type FormState = {
  fullName: string;
  jobRole: string;
  experienceLevel: string;
  careerGoal: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profileDescription: string;
};

const fieldLimits: Record<keyof FormState, number> = {
  fullName: 120,
  jobRole: 120,
  experienceLevel: 50,
  careerGoal: 500,
  githubUrl: 300,
  linkedinUrl: 300,
  portfolioUrl: 300,
  profileDescription: 1000,
};

const copy = {
  en: {
    badge: "Profile builder",
    title: "Create your profile",
    description: "Only 4 fields required. Generate your roadmap in under 60 seconds.",
    fullName: "Full name *",
    jobRole: "Professional area *",
    experienceLevel: "Experience level *",
    experienceLevels: ["Student", "Junior", "Mid-level", "Senior", "Career changer"],
    careerGoal: "Career goal *",
    optionalTitle: "Improve your analysis",
    optionalDesc: "Add more details for a better roadmap.",
    githubUrl: "GitHub URL",
    linkedinUrl: "LinkedIn URL",
    portfolioUrl: "Portfolio URL",
    profileDescription: "About you",
    submit: "Continue",
    saving: "Saving...",
    analyzing: "AI analyzing your profile...",
    errorGenerate: "Could not generate roadmap. Please try again.",
    errorTooLong: "One or more fields are too long.",
    settings: "Settings",
    languageLabel: "Language",
    signOut: "Sign out",
  },
  es: {
    badge: "Constructor de perfil",
    title: "Crea tu perfil",
    description: "Solo 4 campos obligatorios. Genera tu roadmap en menos de 60 segundos.",
    fullName: "Nombre completo *",
    jobRole: "Area profesional *",
    experienceLevel: "Nivel de experiencia *",
    experienceLevels: ["Estudiante", "Junior", "Nivel medio", "Senior", "Cambio de carrera"],
    careerGoal: "Objetivo profesional *",
    optionalTitle: "Mejora tu analisis",
    optionalDesc: "Agrega mas detalles para un mejor roadmap.",
    githubUrl: "URL de GitHub",
    linkedinUrl: "URL de LinkedIn",
    portfolioUrl: "URL de portfolio",
    profileDescription: "Sobre ti",
    submit: "Continuar",
    saving: "Guardando...",
    analyzing: "IA analizando tu perfil...",
    errorGenerate: "No se pudo generar el roadmap. Intentalo de nuevo.",
    errorTooLong: "Uno o mas campos son demasiado largos.",
    settings: "Settings",
    languageLabel: "Language",
    signOut: "Cerrar sesion",
  },
} as const;

type Step = "idle" | "saving" | "analyzing";

export function ProfileClient({ user }: { user?: { id?: string; email?: string | null; user_metadata?: { full_name?: string } } | null }) {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = copy[language];
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [step, setStep] = useState<Step>("idle");
  const [apiError, setApiError] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: user?.user_metadata?.full_name ?? "",
    jobRole: "",
    experienceLevel: t.experienceLevels[0],
    careerGoal: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    profileDescription: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) { setLoadingProfile(false); return; }
      const { data, error } = await supabase.from("user_profiles").select("*").eq("auth_id", user.id).maybeSingle();
      if (!error && data) {
        setForm({
          fullName: data.full_name ?? user?.user_metadata?.full_name ?? "",
          jobRole: data.job_role ?? "",
          experienceLevel: data.experience_level ?? t.experienceLevels[0],
          careerGoal: data.career_goal ?? "",
          githubUrl: data.github_url ?? "",
          linkedinUrl: data.linkedin_url ?? "",
          portfolioUrl: data.portfolio_url ?? "",
          profileDescription: data.bio ?? "",
        });
        if (data.github_url || data.linkedin_url || data.portfolio_url || data.bio) setShowOptional(true);
      }
      setLoadingProfile(false);
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, supabase, t.experienceLevels]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) return;
    setApiError("");

    const hasOversizedField = (Object.entries(form) as [keyof FormState, string][]).some(([key, value]) => value.length > fieldLimits[key]);
    if (hasOversizedField) {
      setApiError(t.errorTooLong);
      return;
    }

    setStep("saving");

    const { error } = await supabase.from("user_profiles").upsert({
      auth_id: user.id,
      email: user.email ?? "",
      full_name: form.fullName.trim() || (user?.user_metadata?.full_name ?? ""),
      job_role: form.jobRole.trim() || null,
      experience_level: form.experienceLevel || null,
      career_goal: form.careerGoal.trim() || null,
      github_url: form.githubUrl.trim() || null,
      linkedin_url: form.linkedinUrl.trim() || null,
      portfolio_url: form.portfolioUrl.trim() || null,
      bio: form.profileDescription.trim() || null,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "auth_id" });

    if (error) {
      if (error.code === "42501" || error.message?.includes("permission denied")) {
        router.push("/login");
        return;
      }
      setStep("idle");
      setApiError(error.message);
      return;
    }
    setStep("analyzing");

    const result = await apiFetch<{ ok?: boolean }>("/api/ai/analysis", { method: "POST", body: JSON.stringify({}) });
    if (!result.ok || !result.data.ok) { setStep("idle"); setApiError(result.ok ? t.errorGenerate : result.error); return; }
    router.push("/roadmap");
  }

  const isBusy = step !== "idle";
  const buttonLabel = step === "analyzing" ? t.analyzing : step === "saving" ? t.saving : t.submit;

  const inputClass = "glass-surface w-full rounded-[12px] px-4 py-3 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] disabled:opacity-50";

  return (
    <main className="relative min-h-screen px-4 py-6 pb-safe lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user} />

        <GlassCard>
          <SectionBadge>{t.badge}</SectionBadge>
          <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">{t.description}</p>

          {loadingProfile ? (
            <div className="mt-8 grid gap-4" aria-label="Loading profile form">
              <SkeletonBlock className="h-12" />
              <div className="grid gap-4 sm:grid-cols-2"><SkeletonBlock className="h-12" /><SkeletonBlock className="h-12" /></div>
              <SkeletonBlock className="h-12" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-14 rounded-full" />
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              {apiError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}

              <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.fullName}</span>
                <input value={form.fullName} onChange={(e) => setForm((c) => ({ ...c, fullName: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.fullName} maxLength={fieldLimits.fullName} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.jobRole}</span>
                  <input value={form.jobRole} onChange={(e) => setForm((c) => ({ ...c, jobRole: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.jobRole} maxLength={fieldLimits.jobRole} />
                </label>
                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.experienceLevel}</span>
                  <select value={form.experienceLevel} onChange={(e) => setForm((c) => ({ ...c, experienceLevel: e.target.value }))} disabled={isBusy} className={inputClass}>
                    {t.experienceLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </label>
              </div>

              <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.careerGoal}</span>
                <input value={form.careerGoal} onChange={(e) => setForm((c) => ({ ...c, careerGoal: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.careerGoal} maxLength={fieldLimits.careerGoal} />
              </label>

              <button type="button" onClick={() => setShowOptional(!showOptional)} className="text-left text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={"mr-1 inline-block transition-transform " + (showOptional ? "rotate-90" : "")}><path d="M9 18l6-6-6-6" /></svg>{t.optionalTitle}
              </button>
              {showOptional && (
                <div className="space-y-4 rounded-2xl bg-white/50 p-4">
                  <p className="text-xs text-slate-500">{t.optionalDesc}</p>
                  <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.linkedinUrl}</span>
                    <input value={form.linkedinUrl} onChange={(e) => setForm((c) => ({ ...c, linkedinUrl: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.linkedinUrl} maxLength={fieldLimits.linkedinUrl} />
                  </label>
                  <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.githubUrl}</span>
                    <input value={form.githubUrl} onChange={(e) => setForm((c) => ({ ...c, githubUrl: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.githubUrl} maxLength={fieldLimits.githubUrl} />
                  </label>
                  <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.portfolioUrl}</span>
                    <input value={form.portfolioUrl} onChange={(e) => setForm((c) => ({ ...c, portfolioUrl: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.portfolioUrl} maxLength={fieldLimits.portfolioUrl} />
                  </label>
                  <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t.profileDescription}</span>
                    <textarea rows={3} value={form.profileDescription} onChange={(e) => setForm((c) => ({ ...c, profileDescription: e.target.value }))} disabled={isBusy} className={inputClass} placeholder={t.profileDescription} maxLength={fieldLimits.profileDescription} />
                  </label>
                </div>
              )}

              <button type="submit" disabled={isBusy} className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 disabled:opacity-60">
                {isBusy && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{buttonLabel}
              </button>
            </form>
          )}
        </GlassCard>

        <GlassCard className="lg:hidden">
          <h2 className="text-sm font-bold text-slate-950">{t.settings}</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{t.languageLabel}</span>
              <div className="flex gap-1 rounded-full border border-white/60 bg-white/50 p-0.5">
                <button type="button" onClick={() => setLanguage("en")} className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (language === "en" ? "bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow" : "text-slate-500 hover:text-slate-700")}>EN</button>
                <button type="button" onClick={() => setLanguage("es")} className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (language === "es" ? "bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow" : "text-slate-500 hover:text-slate-700")}>ES</button>
              </div>
            </div>
            <button type="button" onClick={() => setShowSignOutModal(true)} className="inline-flex h-10 w-full items-center justify-center rounded-full border border-white/60 bg-white/50 text-sm font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/70 hover:text-slate-900">{t.signOut}</button>
          </div>
        </GlassCard>

        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSignOutModal(false)}>
            <div className="glass-surface mx-4 w-full max-w-sm rounded-[24px] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l4-4-4-4m4 4H9" /></svg>
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-950">{t.signOut}?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{language === "en" ? "Are you sure you want to sign out?" : "Seguro que quieres cerrar sesion?"}</p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowSignOutModal(false)} className="flex-1 rounded-full border border-white/70 bg-white/50 py-2.5 text-sm font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/70">{language === "en" ? "Cancel" : "Cancelar"}</button>
                <button type="button" onClick={() => router.push("/auth/logout")} className="flex-1 rounded-full bg-gradient-to-r from-red-500 to-red-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5">{t.signOut}</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav language={language} copy={shellCopy} user={user} />
    </main>
  );
}
