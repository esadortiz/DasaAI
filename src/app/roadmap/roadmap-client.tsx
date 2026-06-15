"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard, SectionBadge, ShellHeader, BottomNav, SkeletonBlock, useLanguage } from "../../components/site-shell";
import { createClient } from "../../lib/supabase/client";

type RoadmapData = {
  id: number;
  career_goal: string | null;
  job_role: string | null;
  strengths: string[] | null;
  skill_gaps: { name: string; level: number }[] | null;
  roadmap: { "30": unknown[]; "60": unknown[]; "90": unknown[] } | null;
  recommended_projects: { title: string; description: string; skills: string[] }[] | null;
  interview_prep: { question: string; tip: string }[] | null;
} | null;

const translations = {
  en: {
    badge: "Your Career Roadmap",
    title: "Your career roadmap",
    goalLabel: "Target Role",
    scoreLabel: "Fit Score",
    nextAction: "Next action",
    phasesTitle: "30 / 60 / 90 Day Plan",
    strengthsTitle: "Strengths",
    gapsTitle: "Skill Gaps",
    projectsTitle: "Recommended Projects",
    interviewTitle: "Interview Preparation",
    questionLabel: "Question",
    tipLabel: "Expert Tip",
    coachCta: "Talk to my AI Coach",
    profileCta: "Back to profile",
    empty: { title: "No roadmap yet", desc: "Complete your profile and generate your first roadmap.", cta: "Go to profile" },
  },
  es: {
    badge: "Tu Roadmap de Carrera",
    title: "Tu roadmap de carrera",
    goalLabel: "Rol Objetivo",
    scoreLabel: "Fit Score",
    nextAction: "Proxima accion",
    phasesTitle: "Plan 30 / 60 / 90 Dias",
    strengthsTitle: "Fortalezas",
    gapsTitle: "Brechas de Habilidades",
    projectsTitle: "Proyectos Recomendados",
    interviewTitle: "Preparacion para Entrevistas",
    questionLabel: "Pregunta",
    tipLabel: "Consejo Experto",
    coachCta: "Hablar con mi AI Coach",
    profileCta: "Volver al perfil",
    empty: { title: "Sin roadmap aun", desc: "Completa tu perfil y genera tu primer roadmap.", cta: "Ir al perfil" },
  },
};

function ScoreRing({ score }: { score: number }) {
  const r = 52; const c = 2 * Math.PI * r; const o = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#fg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={o} />
        <defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#38BDF8" /></linearGradient></defs>
      </svg>
      <div className="absolute flex flex-col items-center"><span className="text-3xl font-bold text-slate-950">{score}%</span><span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Fit</span></div>
    </div>
  );
}

export function RoadmapClient({ user }: { user?: { id?: string; email?: string | null } | null }) {
  const supabase = createClient();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapData>(null);

  useEffect(() => {
    async function load() {
      if (!user?.id) { setLoading(false); return; }
      const { data: profile } = await supabase.from("user_profiles").select("id").eq("auth_id", user.id).maybeSingle();
      if (!profile) { setLoading(false); return; }
      const { data } = await supabase.from("career_roadmaps").select("*").eq("user_profile_id", (profile as Record<string, unknown>).id as number).eq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle();
      setRoadmap(data as RoadmapData);
      setLoading(false);
    }
    load();
  }, [user?.id, supabase]);

  if (loading) {
    return <main className="relative min-h-screen px-4 py-6 lg:px-8"><ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} /><GlassCard className="mx-auto mt-8 max-w-5xl"><div className="grid gap-4" aria-label="Loading roadmap"><SkeletonBlock className="h-8 w-48" /><SkeletonBlock className="h-24" /><div className="grid gap-4 md:grid-cols-3"><SkeletonBlock className="h-40" /><SkeletonBlock className="h-40" /><SkeletonBlock className="h-40" /></div></div></GlassCard></main>;
  }

  if (!roadmap) {
    return (
      <main className="relative min-h-screen px-4 py-6 pb-safe lg:px-8">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} />
        <GlassCard><div className="flex flex-col items-center py-16 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5"><path d="M1 6v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2zm4 4h14M5 14h10" /></svg></div><h2 className="mt-6 text-2xl font-bold text-slate-950">{t.empty.title}</h2><p className="mt-3 max-w-md text-slate-600">{t.empty.desc}</p><Link href="/profile" className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-8 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">{t.empty.cta}</Link></div></GlassCard>
        <BottomNav language={language} copy={shellCopy} user={user} />
      </main>
    );
  }

  const strengths = (roadmap.strengths ?? []) as string[];
  const gaps = (roadmap.skill_gaps ?? []) as { name: string; level: number }[];
  const projects = (roadmap.recommended_projects ?? []) as { title: string; description: string; skills: string[] }[];
  const interview = (roadmap.interview_prep ?? []) as { question: string; tip: string }[];
  const phases = (roadmap.roadmap ?? { "30": [], "60": [], "90": [] }) as { "30": unknown[]; "60": unknown[]; "90": unknown[] };

  function phaseItems(k: "30" | "60" | "90"): string[] {
    const items = phases[k]; if (!Array.isArray(items)) return [];
    return items.map((item: unknown) => { if (typeof item === "string") return item; if (item && typeof item === "object") { const o = item as Record<string, unknown>; return String(o.title ?? o.description ?? JSON.stringify(item)); } return String(item); });
  }

  const totalItems = Object.values(phases).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  const score = Math.min(95, 50 + totalItems * 4 + strengths.length * 2);
  const nextAction = phaseItems("30")[0] ?? gaps?.[0]?.name ?? null;

  return (
    <main className="relative min-h-screen px-4 py-6 pb-safe lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} />

        <div>
          <SectionBadge>{t.badge}</SectionBadge>
          <h1 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-3xl">{t.title}</h1>
        </div>

        {/* 1. Goal + Score */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <GlassCard className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.goalLabel}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{roadmap.career_goal || roadmap.job_role || "—"}</p>
            <p className="mt-0.5 text-sm text-slate-500">{roadmap.job_role || ""}</p>
          </GlassCard>
          <GlassCard className="flex items-center justify-center py-2"><ScoreRing score={score} /></GlassCard>
        </div>

        {/* 2. Next action */}
        {nextAction && (
          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.nextAction}</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{nextAction}</p>
          </GlassCard>
        )}

        {/* 3. 30/60/90 Plan */}
        <div>
          <h2 className="text-xl font-bold text-slate-950">{t.phasesTitle}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {(["30", "60", "90"] as const).map((p) => {
              const items = phaseItems(p); if (items.length === 0) return null;
              return (
                <GlassCard key={p} className="h-full">
                  <div className="inline-flex rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">{p} days</div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {items.map((item, i) => <li key={i} className="flex items-start gap-2 rounded-2xl bg-white/70 px-3 py-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />{item}</li>)}
                  </ul>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* 4. Strengths + Gaps */}
        {(strengths.length > 0 || gaps.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {strengths.length > 0 && (
              <GlassCard>
                <h2 className="text-lg font-bold text-slate-950">{t.strengthsTitle}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {strengths.map((s) => <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />{s}</span>)}
                </div>
              </GlassCard>
            )}
            {gaps.length > 0 && (
              <GlassCard>
                <h2 className="text-lg font-bold text-slate-950">{t.gapsTitle}</h2>
                <div className="mt-3 space-y-3">
                  {gaps.map((g) => (
                    <div key={g.name}><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{g.name}</span><span className="text-xs font-semibold text-slate-500">{g.level}%</span></div>
                      <div className="mt-1.5 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8]" style={{ width: `${g.level}%` }} /></div></div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* 5. Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950">{t.projectsTitle}</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {projects.map((p) => (
                <GlassCard key={p.title} className="h-full">
                  <h3 className="text-base font-semibold text-slate-950">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">{p.skills?.map((s) => <span key={s} className="rounded-full bg-gradient-to-r from-[#DBEAFE] to-[#E0E7FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]">{s}</span>)}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* 6. Interview Prep */}
        {interview.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950">{t.interviewTitle}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {interview.map((q) => (
                <GlassCard key={q.question}>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{t.questionLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{q.question}</p>
                  <div className="mt-3 rounded-xl bg-white/70 p-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">{t.tipLabel}</p><p className="mt-1 text-sm text-slate-600">{q.tip}</p></div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <GlassCard className="text-center">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/coach" className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-8 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">{t.coachCta}</Link>
            <Link href="/profile" className="inline-flex h-14 items-center justify-center rounded-full border border-white/70 bg-white/50 px-7 text-sm font-semibold text-slate-700 backdrop-blur-md transition hover:bg-white/70">{t.profileCta}</Link>
          </div>
        </GlassCard>
      </div>
      <BottomNav language={language} copy={shellCopy} user={user} />
    </main>
  );
}
