"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GlassCard, SectionBadge, ShellHeader, BottomNav, SkeletonBlock, useLanguage } from "../../components/site-shell";
import { createClient } from "../../lib/supabase/client";
import { apiFetch } from "@/lib/api/api-fetch";

type Message = { role: "user" | "ai"; text: string };

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function SafeCoachText({ text }: { text: string }) {
  return (
    <div className="space-y-1 whitespace-pre-wrap">
      {text.split("\n").map((line, index) => {
        const bullet = line.match(/^\s*[-*•]\s+(.+)/);
        const numbered = line.match(/^\s*\d+\.\s+(.+)/);
        if (bullet || numbered) {
          return (
            <div key={index} className="flex gap-2">
              <span aria-hidden="true">{bullet ? "•" : "-"}</span>
              <span><InlineText text={(bullet?.[1] ?? numbered?.[1] ?? "").trim()} /></span>
            </div>
          );
        }
        return <p key={index}><InlineText text={line} /></p>;
      })}
    </div>
  );
}

const quickActions = [
  { en: "Improve my CV", es: "Mejorar mi CV" },
  { en: "Prepare me for an interview", es: "Prepararme para una entrevista" },
  { en: "Look for internships", es: "Buscar practicas" },
  { en: "Suggest projects", es: "Sugerir proyectos" },
] as const;

const translations = {
  en: {
    badge: "AI Career Coach",
    title: "Your Career Coach",
    desc: "Ask anything about your career path.",
    quickActions: "Quick actions",
    send: "Send",
    placeholder: "Type a message...",
    typing: "Typing...",
    error: "Could not reach the coach. Try again.",
    historyError: "Could not load your previous messages.",
    noRoadmapTitle: "No roadmap yet",
    noRoadmapDesc: "Generate your roadmap first so I can give you personalized coaching.",
    noRoadmapCta: "Go to profile",
    initial: (name: string, role: string) => `Hi ${name}! I'm your AI Career Coach. I can help you with your CV, interviews, internships, and project ideas. Based on your profile as ${role || "a professional"}, what would you like to work on?`,
  },
  es: {
    badge: "AI Career Coach",
    title: "Tu Coach de Carrera",
    desc: "Pregunta lo que quieras sobre tu carrera.",
    quickActions: "Acciones rapidas",
    send: "Enviar",
    placeholder: "Escribe un mensaje...",
    typing: "Escribiendo...",
    error: "No se pudo contactar al coach. Intenta de nuevo.",
    historyError: "No se pudieron cargar tus mensajes anteriores.",
    noRoadmapTitle: "Sin roadmap aun",
    noRoadmapDesc: "Genera tu roadmap primero para recibir coaching personalizado.",
    noRoadmapCta: "Ir al perfil",
    initial: (name: string, role: string) => `Hola ${name}! Soy tu Coach de Carrera IA. Puedo ayudarte con tu CV, entrevistas, practicas e ideas de proyectos. Basado en tu perfil como ${role || "profesional"}, en que te gustaria trabajar?`,
  },
};

export function CoachClient({ user }: { user?: { id?: string; email?: string | null; user_metadata?: { full_name?: string } } | null }) {
  const supabase = createClient();
  const { language, setLanguage, copy: shellCopy } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [roadmap, setRoadmap] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    async function load() {
      if (!user?.id) { setLoading(false); return; }
      const { data: prof } = await supabase.from("user_profiles").select("id, full_name, job_role, experience_level, career_goal").eq("auth_id", user.id).maybeSingle();
      setProfile(prof);

      if (prof) {
        const profileId = (prof as Record<string, unknown>).id as number;
        const { data: rd } = await supabase.from("career_roadmaps").select("id").eq("user_profile_id", profileId).eq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle();
        setRoadmap(rd);

        const { data: history, error: historyError } = await supabase
          .from("ai_chat_history")
          .select("role, message")
          .eq("user_profile_id", profileId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (historyError) {
          setLoadError(t.historyError);
        } else if (history && history.length > 0) {
          setMessages(history.map((item) => ({ role: item.role === "user" ? "user" : "ai", text: item.message })));
        } else {
          const name = (prof.full_name as string) || user?.user_metadata?.full_name || "User";
          const role = (prof.job_role as string) || "";
          setMessages([{ role: "ai", text: t.initial(name, role) }]);
        }
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function sendMessage(text: string) {
    const next = text.trim(); if (!next || sending) return;
    setMessages((c) => [...c, { role: "user", text: next }]);
    setInput(""); setSending(true);
    setMessages((c) => [...c, { role: "ai", text: t.typing }]);
    try {
      const result = await apiFetch<{ reply?: string }>("/api/ai/chat", { method: "POST", body: JSON.stringify({ message: next }) });
      setMessages((c) => {
        const w = c.slice(0, -1);
        return [...w, { role: "ai", text: result.ok ? (result.data.reply || t.error) : result.error }];
      });
    } catch {
      setMessages((c) => { const w = c.slice(0, -1); return [...w, { role: "ai", text: t.error }]; });
    }
    setSending(false);
  }

  if (loading) {
    return <main className="relative min-h-screen px-4 py-6 lg:px-8"><ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} /><GlassCard className="mx-auto mt-8 max-w-3xl"><div className="space-y-4" aria-label="Loading coach"><SkeletonBlock className="h-6 w-40" /><SkeletonBlock className="h-16 w-3/4" /><SkeletonBlock className="ml-auto h-12 w-2/3" /><SkeletonBlock className="h-16 w-4/5" /><SkeletonBlock className="h-14 rounded-full" /></div></GlassCard></main>;
  }

  if (!roadmap) {
    return (
      <main className="relative min-h-screen px-4 py-6 pb-safe lg:px-8">
        <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} />
        <GlassCard><div className="flex flex-col items-center py-16 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div><h2 className="mt-6 text-2xl font-bold text-slate-950">{t.noRoadmapTitle}</h2><p className="mt-3 max-w-md text-slate-600">{t.noRoadmapDesc}</p><Link href="/profile" className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-8 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">{t.noRoadmapCta}</Link></div></GlassCard>
        <BottomNav language={language} copy={shellCopy} user={user} />
      </main>
    );
  }

  const name = (profile?.full_name as string) || user?.user_metadata?.full_name || "User";
  const initials = (name as string).split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "?";

  return (
    <main className="relative flex min-h-screen flex-col px-4 py-6 pb-safe lg:px-8">
      <ShellHeader language={language} setLanguage={setLanguage} copy={shellCopy} user={user ? { id: user.id, email: user.email } : undefined} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div className="mb-3 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-xs font-bold text-white">{initials}</div>
          <div><p className="text-sm font-semibold text-slate-900">{name}</p></div>
        </div>

        <GlassCard className="flex flex-1 flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="hidden lg:block"><SectionBadge>{t.badge}</SectionBadge></div>
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-[9px] font-bold text-white shadow-md">AI</div>}
                <div className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-sm leading-6 shadow-sm backdrop-blur-md ${msg.role === "user" ? "bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white" : "border border-white/70 bg-white/70 text-slate-700"}`}>
                  {msg.role === "ai" && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Coach</p>}
                  {msg.role === "ai" ? <SafeCoachText text={msg.text} /> : <div className="whitespace-pre-wrap">{msg.text}</div>}
                </div>
              </div>
            ))}
            {loadError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/50 px-4 py-3 sm:px-5">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickActions.map((a) => {
                const label = a[language];
                return <button key={a.en} type="button" onClick={() => sendMessage(label)} disabled={sending} className="rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur-md transition hover:bg-white hover:text-slate-900 disabled:opacity-40">{label}</button>;
              })}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} disabled={sending} className="glass-surface w-full rounded-[14px] px-4 py-2.5 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] disabled:opacity-50" placeholder={t.placeholder} />
              <button type="button" onClick={() => sendMessage(input)} disabled={sending} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:opacity-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
      <BottomNav language={language} copy={shellCopy} user={user} />
    </main>
  );
}
