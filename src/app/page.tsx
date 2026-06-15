"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard, SectionBadge, ShellHeader, BottomNav, useLanguage } from "../components/site-shell";
import { createClient } from "../lib/supabase/client";

type DashboardData = {
  full_name: string | null;
  job_role: string | null;
  experience_level: string | null;
  career_goal: string | null;
  roadmapScore: number | null;
  roadmapId: number | null;
  nextAction: string | null;
} | null;

const translations = {
  en: {
    greeting: (name: string) => `Hi, ${name}`,
    noRole: "Complete your profile",
    goalLabel: "Career goal",
    scoreLabel: "Fit Score",
    nextActionLabel: "Next action",
    noRoadmap: "No roadmap yet",
    quickActions: "Quick actions",
    viewRoadmap: "View Roadmap",
    talkCoach: "Talk to Coach",
    updateProfile: "Update Profile",
    landing: {
      badge: "AI Career Growth Navigator",
      title: "Your AI Career Growth Navigator",
      description: "Turn your ambition into a clear path. Analyze your skills, detect gaps, and get a personalized career roadmap powered by AI.",
      cta: "Get Started",
      ctaHow: "See how it works",
      benefits: [
        { title: "AI Career Analysis", desc: "Detect strengths, gaps, and opportunities with a clear reading of your profile." },
        { title: "Personalized Roadmap", desc: "Get a 30/60/90 day action plan tailored to your career goals." },
        { title: "AI Career Coach", desc: "Chat with your personal coach about CV, interviews, projects, and learning paths." },
      ],
      steps: [
        { title: "Create your profile", desc: "Tell us your role, experience, and career goals in 60 seconds." },
        { title: "AI analyzes your profile", desc: "Our AI evaluates your strengths, detects skill gaps, and compares against your target role." },
        { title: "Get your roadmap", desc: "Receive a detailed 30/60/90 day plan with projects, learning resources, and interview prep." },
        { title: "Work with your Coach", desc: "Refine your plan, practice interviews, and get personalized career guidance." },
      ],
      ctaFinal: "Start your career journey",
    },
  },
  es: {
    greeting: (name: string) => `Hola, ${name}`,
    noRole: "Completa tu perfil",
    goalLabel: "Objetivo profesional",
    scoreLabel: "Fit Score",
    nextActionLabel: "Proxima accion",
    noRoadmap: "Sin roadmap aun",
    quickActions: "Acciones rapidas",
    viewRoadmap: "Ver Roadmap",
    talkCoach: "Hablar con Coach",
    updateProfile: "Actualizar Perfil",
    landing: {
      badge: "Navegador de Crecimiento Profesional con IA",
      title: "Tu Navegador de Crecimiento Profesional con IA",
      description: "Convierte tu ambicion en un camino claro. Analiza tus habilidades, detecta brechas y obten un roadmap personalizado potenciado por IA.",
      cta: "Comenzar",
      ctaHow: "Ver como funciona",
      benefits: [
        { title: "Analisis de Carrera con IA", desc: "Detecta fortalezas, brechas y oportunidades con una lectura clara de tu perfil." },
        { title: "Roadmap Personalizado", desc: "Obten un plan de accion 30/60/90 dias adaptado a tus metas profesionales." },
        { title: "Coach de Carrera IA", desc: "Chatea con tu coach personal sobre CV, entrevistas, proyectos y aprendizaje." },
      ],
      steps: [
        { title: "Crea tu perfil", desc: "Cuentanos tu rol, experiencia y metas profesionales en 60 segundos." },
        { title: "IA analiza tu perfil", desc: "Nuestra IA evalua tus fortalezas, detecta brechas y compara contra tu rol objetivo." },
        { title: "Obten tu roadmap", desc: "Recibe un plan detallado 30/60/90 dias con proyectos, recursos y preparacion de entrevistas." },
        { title: "Trabaja con tu Coach", desc: "Refina tu plan, practica entrevistas y recibe orientacion profesional personalizada." },
      ],
      ctaFinal: "Inicia tu viaje profesional",
    },
  },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="110" height="110" className="-rotate-90">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="6" />
        <circle cx="55" cy="55" r={radius} fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-950">{score}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fit</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [user, setUser] = useState<{ id?: string; email?: string | null; user_metadata?: { full_name?: string } } | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }
      setUser(u);

      const { data: profile } = await supabase.from("user_profiles").select("id, full_name, job_role, experience_level, career_goal").eq("auth_id", u.id).maybeSingle();

      if (profile) {
        const { data: roadmap } = await supabase.from("career_roadmaps").select("id, roadmap").eq("user_profile_id", (profile as Record<string, unknown>).id as number).eq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle();

        const roadmapData = (roadmap?.roadmap as Record<string, unknown[]>) || {};
        const totalItems = Object.values(roadmapData).reduce((s: number, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
        const score = roadmap ? Math.min(95, 50 + totalItems * 4) : null;
        const firstAction = (roadmapData?.["30"] as { title?: string }[])?.[0]?.title ?? null;

        setDashboard({
          full_name: (profile as Record<string, unknown>).full_name as string || u.user_metadata?.full_name || null,
          job_role: (profile as Record<string, unknown>).job_role as string || null,
          experience_level: (profile as Record<string, unknown>).experience_level as string || null,
          career_goal: (profile as Record<string, unknown>).career_goal as string || null,
          roadmapScore: score,
          roadmapId: roadmap?.id as number || null,
          nextAction: firstAction as string | null,
        });
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <main className="relative min-h-screen px-4 py-6 lg:px-8">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} />
        <div className="flex items-center justify-center py-32"><div className="h-10 w-10 animate-spin rounded-full border-3 border-[#2563EB] border-t-transparent" /></div>
      </main>
    );
  }

  // ─────── DASHBOARD (authenticated) ───────
  if (user) {
    const name = dashboard?.full_name || user.user_metadata?.full_name || "User";
    const role = dashboard?.job_role || "";
    const goal = dashboard?.career_goal || "";
    const score = dashboard?.roadmapScore;

    return (
      <main className="relative min-h-screen px-4 py-6 pb-safe lg:px-8">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user} />
        <div className="mx-auto mt-4 max-w-2xl space-y-5 lg:mt-6">
          <div>
            <SectionBadge>DasaAI</SectionBadge>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-3xl">{t.greeting(name)}</h1>
            {role && <p className="mt-1 text-base text-slate-600">{role}{goal ? ` · ${goal}` : ""}</p>}
          </div>

          {score != null ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard className="flex flex-col items-center justify-center py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.scoreLabel}</p>
                <div className="mt-3"><ScoreRing score={score} /></div>
              </GlassCard>
              <GlassCard className="flex flex-col justify-center py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.nextActionLabel}</p>
                <p className="mt-2 text-sm leading-6 font-medium text-slate-800">{dashboard?.nextAction || t.noRoadmap}</p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="py-8 text-center">
              <p className="text-slate-500 text-sm">{t.noRoadmap}</p>
              <Link href="/profile" className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">{t.updateProfile}</Link>
            </GlassCard>
          )}

          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t.quickActions}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link href={score != null ? "/roadmap" : "/profile"} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 transition hover:bg-white hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M1 6v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2zm4 4h14M5 14h10" /></svg>
                </span>
                <span className="text-sm font-semibold text-slate-800">{t.viewRoadmap}</span>
              </Link>
              <Link href="/coach" className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 transition hover:bg-white hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </span>
                <span className="text-sm font-semibold text-slate-800">{t.talkCoach}</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 transition hover:bg-white hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
                </span>
                <span className="text-sm font-semibold text-slate-800">{t.updateProfile}</span>
              </Link>
            </div>
          </GlassCard>
        </div>
        <BottomNav language={language} copy={shellCopy} user={user} />
      </main>
    );
  }

  // ─────── LANDING (public) ───────
  const l = t.landing;
  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.95),rgba(219,234,254,0)_70%)] blur-2xl" />
        <div className="absolute right-[-7rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.45),rgba(224,231,255,0)_68%)] blur-2xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} />

        <section className="py-12 text-center lg:py-20">
          <SectionBadge>{l.badge}</SectionBadge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">{l.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{l.description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/profile" className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-8 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5">{l.cta}</Link>
            <Link href="#features" className="inline-flex h-14 items-center justify-center rounded-full border border-white/70 bg-white/50 px-7 text-sm font-semibold text-slate-700 backdrop-blur-md transition hover:bg-white/70">{l.ctaHow}</Link>
          </div>
        </section>

        <section id="features" className="py-10">
          <div className="mx-auto max-w-6xl text-center">
            <SectionBadge>Features</SectionBadge>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {l.benefits.map((b) => (
                <GlassCard key={b.title} className="text-left">
                  <h3 className="text-lg font-bold text-slate-950">{b.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{b.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="py-10">
          <div className="mx-auto max-w-4xl text-center">
            <SectionBadge>{shellCopy.nav.process}</SectionBadge>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {l.steps.map((s, i) => (
                <GlassCard key={i} className="relative text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-sm font-bold text-white shadow-lg shadow-blue-500/20">{i + 1}</div>
                  <h3 className="mt-4 text-sm font-bold text-slate-950">{s.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-600">{s.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 text-center">
          <GlassCard className="mx-auto max-w-2xl px-8 py-10">
            <h2 className="text-2xl font-bold text-slate-950">{l.ctaFinal}</h2>
            <Link href="/profile" className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-8 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5">{l.cta}</Link>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
