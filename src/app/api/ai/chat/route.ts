import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { callFoundry } from "@/lib/ai/ai-client";
import { isAllowedRequestOrigin } from "@/lib/security/csrf";
import { checkDistributedRateLimit, getClientIp, rateLimitHeaders } from "@/lib/security/rate-limit";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never));
        },
      },
    }
  );
}

function buildCoachSystemPrompt(profile: Record<string, unknown>, roadmap: Record<string, unknown> | null) {
  const name = (profile.full_name as string) || "User";
  const role = (profile.job_role as string) || (roadmap?.job_role as string) || "professional";
  const goal = (profile.career_goal as string) || (roadmap?.career_goal as string) || "career growth";
  const level = (profile.experience_level as string) || "mid-level";

  let context = `You are DasaAI Career Coach, an expert career advisor. You help with CV improvement, interview preparation, skill development, and career strategy.\n\nUSER CONTEXT:\n- Name: ${name}\n- Current role: ${role}\n- Experience: ${level}\n- Target: ${goal}\n\n`;

  if (roadmap) {
    const strengths = Array.isArray(roadmap.strengths) ? (roadmap.strengths as string[]).join(", ") : "none listed";
    const gaps = Array.isArray(roadmap.skill_gaps)
      ? (roadmap.skill_gaps as { name: string; level: number }[]).map((g) => `${g.name} (${g.level}%)`).join(", ")
      : "none listed";
    const projects = Array.isArray(roadmap.recommended_projects)
      ? (roadmap.recommended_projects as { title: string }[]).map((p) => p.title).join(" | ")
      : "none listed";
    const interview = Array.isArray(roadmap.interview_prep)
      ? (roadmap.interview_prep as { question: string }[]).map((q) => q.question).join(" | ")
      : "none listed";

    const rd = (roadmap.roadmap as Record<string, unknown[]>) || {};
    const phase30 = Array.isArray(rd["30"]) ? (rd["30"] as { title: string }[]).map((a) => a.title || JSON.stringify(a)).join("; ") : "none";
    const phase60 = Array.isArray(rd["60"]) ? (rd["60"] as { title: string }[]).map((a) => a.title || JSON.stringify(a)).join("; ") : "none";
    const phase90 = Array.isArray(rd["90"]) ? (rd["90"] as { title: string }[]).map((a) => a.title || JSON.stringify(a)).join("; ") : "none";

    context += `CAREER ANALYSIS:\n- Strengths: ${strengths}\n- Skill gaps: ${gaps}\n- Recommended projects: ${projects}\n- Interview prep topics: ${interview}\n- 30-day plan: ${phase30}\n- 60-day plan: ${phase60}\n- 90-day plan: ${phase90}\n\n`;
  }

  context += "RULES:\n- Be concise and practical.\n- Reference the user's specific strengths, gaps, and roadmap when relevant.\n- Give actionable advice, not generic platitudes.\n- Use the user's name.\n- Keep responses under 300 words unless asked for detail.\n- Format with bullet points and bold for key ideas.";

  return context;
}

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await getSupabase();
  const { data: { user } } = (await supabase.auth.getUser()) as { data: { user: { id: string } | null } };
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkDistributedRateLimit(supabase, { key: `chat:${user.id}:${getClientIp(request)}`, limit: 20, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  let body: { message?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profileErr || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: roadmap } = await supabase
    .from("career_roadmaps")
    .select("*")
    .eq("user_profile_id", profile.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Save user message
  await supabase.from("ai_chat_history").insert({
    user_profile_id: profile.id,
    roadmap_id: roadmap?.id ?? null,
    role: "user",
    message,
    model_name: null,
  });

  // Load chat history (last 20 messages)
  const { data: history } = await supabase
    .from("ai_chat_history")
    .select("role, message")
    .eq("user_profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(20);

  // Build system prompt with roadmap context
  const system = buildCoachSystemPrompt(profile, roadmap);

  // Convert history to OpenAI message format
  const historyMessages: { role: string; content: string }[] = [{ role: "system", content: system }];
  if (history) {
    for (const h of history) {
      historyMessages.push({ role: h.role === "ai" ? "assistant" : "user", content: h.message as string });
    }
  }

  const result = await callFoundry(message, historyMessages);

  if (!result.ok) {
    console.error("Foundry chat request failed", { error: result.error });
    return NextResponse.json({ error: "Coach is temporarily unavailable. Please try again in a moment." }, { status: 502 });
  }

  // Extract reply from AI response
  let reply = "I've analyzed your question. Could you provide more details so I can give you specific advice?";
  const data = result.data as Record<string, unknown> | undefined;
  if (data) {
    const choices = data.choices as unknown[] | undefined;
    const first = choices?.[0] as Record<string, unknown> | undefined;
    const msg = first?.message as Record<string, unknown> | undefined;
    const content = msg?.content ?? data.output ?? data.result ?? data.content;
    if (typeof content === "string" && content.trim()) reply = content.trim();
  }

  // Save AI response
  await supabase.from("ai_chat_history").insert({
    user_profile_id: profile.id,
    roadmap_id: roadmap?.id ?? null,
    role: "ai",
    message: reply,
    model_name: (process.env.FOUNDRY_DEPLOYMENT || null) as string | null,
  });

  return NextResponse.json({ reply });
}

export const GET = () => NextResponse.json({ status: "ready" });
