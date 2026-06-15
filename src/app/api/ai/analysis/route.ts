import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import buildRoadmapPrompt from "@/lib/ai/prompts/roadmap-prompt";
import { callFoundry } from "@/lib/ai/ai-client";
import crypto from "crypto";
import { isAllowedRequestOrigin } from "@/lib/security/csrf";
import { checkDistributedRateLimit, getClientIp, rateLimitHeaders } from "@/lib/security/rate-limit";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}

function normalizeFoundryResponse(raw: unknown, fallback: { jobRole: string; careerGoal: string }) {
  try {
    if (!raw) return buildFallback(fallback);

    // DeepSeek/OpenAI returns { choices: [{ message: { content: "..." } }] }
    let content: unknown = raw;
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const choices = Array.isArray(obj.choices) ? (obj.choices[0] as Record<string, unknown> | undefined) : undefined;
      const choiceMsg = (choices?.message as Record<string, unknown> | undefined);
      content = obj.output ?? obj.result ?? choiceMsg?.content ?? (choices?.text as string | undefined) ?? raw;
    }

    // If content is still the raw object without choices, try to use it directly
    if (typeof content === "object" && content !== null) {
      const obj = content as Record<string, unknown>;
      if (!obj.summary && !obj.strengths && !obj.skillGaps) {
        const choices2 = Array.isArray(obj.choices) ? (obj.choices[0] as Record<string, unknown> | undefined) : undefined;
        const choiceMsg2 = (choices2?.message as Record<string, unknown> | undefined);
        content = choiceMsg2?.content ?? (choices2?.text as string | undefined) ?? null;
        if (!content) return buildFallback(fallback);
      }
    }

    // Parse string content
    let parsed: Record<string, unknown> | null = null;
    if (typeof content === "string") {
      // Strip markdown code fences
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) {
          try { parsed = JSON.parse(m[0]); } catch { /* fall through */ }
        }
      }
    } else if (typeof content === "object" && content !== null) {
      parsed = content as Record<string, unknown>;
    }

    if (!parsed) return buildFallback(fallback);

    const { jobRole, careerGoal } = fallback;

    const summary = (typeof parsed.summary === "string" && parsed.summary.trim()) || generateSummary(jobRole, careerGoal);
    const strengths = (Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths.filter((s) => typeof s === "string" && s.trim()) : null) || generateStrengths(jobRole);
    const skillGaps = (Array.isArray(parsed.skillGaps) && parsed.skillGaps.length > 0 ? parsed.skillGaps : null) || generateSkillGaps(jobRole);
    const recommendedProjects = (Array.isArray(parsed.recommendedProjects) && parsed.recommendedProjects.length > 0 ? parsed.recommendedProjects : null) || generateProjects(jobRole, careerGoal);
    const interviewPreparation = (Array.isArray(parsed.interviewPreparation) && parsed.interviewPreparation.length > 0 ? parsed.interviewPreparation : null) || generateInterviewPrep(jobRole);
    const roadmap30 = (Array.isArray(parsed.roadmap30) && parsed.roadmap30.length > 0 ? parsed.roadmap30 : null) || generateRoadmapPhase(30, jobRole, careerGoal);
    const roadmap60 = (Array.isArray(parsed.roadmap60) && parsed.roadmap60.length > 0 ? parsed.roadmap60 : null) || generateRoadmapPhase(60, jobRole, careerGoal);
    const roadmap90 = (Array.isArray(parsed.roadmap90) && parsed.roadmap90.length > 0 ? parsed.roadmap90 : null) || generateRoadmapPhase(90, jobRole, careerGoal);

    return {
      careerGoal: parsed.careerGoal ?? careerGoal,
      jobRole: parsed.jobRole ?? jobRole,
      summary,
      strengths,
      skillGaps,
      recommendedProjects,
      interviewPreparation,
      roadmap30,
      roadmap60,
      roadmap90,
    };
  } catch {
    return buildFallback(fallback);
  }
}

function buildFallback(fb: { jobRole: string; careerGoal: string }) {
  return {
    careerGoal: fb.careerGoal,
    jobRole: fb.jobRole,
    summary: generateSummary(fb.jobRole, fb.careerGoal),
    strengths: generateStrengths(fb.jobRole),
    skillGaps: generateSkillGaps(fb.jobRole),
    recommendedProjects: generateProjects(fb.jobRole, fb.careerGoal),
    interviewPreparation: generateInterviewPrep(fb.jobRole),
    roadmap30: generateRoadmapPhase(30, fb.jobRole, fb.careerGoal),
    roadmap60: generateRoadmapPhase(60, fb.jobRole, fb.careerGoal),
    roadmap90: generateRoadmapPhase(90, fb.jobRole, fb.careerGoal),
  };
}

function generateSummary(jobRole: string, careerGoal: string): string {
  const role = jobRole || "professional";
  const goal = careerGoal || "the next level";
  return `Based on your profile as a ${role}, your path toward ${goal} requires focused skill development, portfolio building, and strategic interview preparation. This roadmap outlines a 90-day plan to close your skill gaps and position you for success.`;
}

function generateStrengths(jobRole: string): string[] {
  const base = [
    "Communication & collaboration",
    "Problem-solving mindset",
    "Adaptability & quick learning",
    "Time management",
    "Attention to detail",
    "Self-motivation & initiative",
  ];
  if (jobRole) base.splice(2, 0, jobRole + " fundamentals");
  return base.slice(0, 6);
}

function generateSkillGaps(jobRole: string): { name: string; level: number }[] {
  const gaps: Record<string, string[]> = {
    designer: ["UX Research", "User Testing", "Data-Driven Design", "Accessibility (WCAG)", "Design Systems"],
    developer: ["System Design", "Testing & QA", "Cloud Infrastructure", "Performance Optimization", "Security Best Practices"],
    data: ["Statistical Analysis", "Machine Learning", "Data Visualization", "SQL & Databases", "A/B Testing"],
    product: ["User Research", "Roadmap Strategy", "Stakeholder Management", "Data Analytics", "Agile & Scrum"],
    marketing: ["SEO & Analytics", "Content Strategy", "Social Media Marketing", "Email Marketing", "Brand Strategy"],
  };
  const key = (jobRole || "").toLowerCase();
  const match = Object.entries(gaps).find(([k]) => key.includes(k));
  const names = match ? match[1] : ["Leadership & mentoring", "Strategic planning", "Technical depth", "Cross-team collaboration", "Industry networking"];
  return names.map((name, i) => ({ name, level: 30 + i * 5 }));
}

function generateProjects(jobRole: string, careerGoal: string): { title: string; description: string; skills: string[] }[] {
  const role = jobRole || "professional";
  const goal = careerGoal || "growth";
  return [
    { title: `Build a ${role} Portfolio Piece`, description: `Create an end-to-end project showcasing your ${role} skills. Document the process from research to delivery, including measurable outcomes and lessons learned.`, skills: [role, "Documentation", "Project Management"] },
    { title: "Cross-Functional Collaboration Project", description: `Lead or contribute to a project with cross-functional stakeholders. Practice communicating ${role} decisions to non-technical audiences and gathering diverse feedback.`, skills: ["Communication", "Stakeholder Management", role] },
    { title: `Personal Development Plan for ${goal}`, description: `Create a detailed skill development plan with weekly goals, learning resources, and progress tracking. Execute it for 30 days and document your growth.`, skills: ["Self-Directed Learning", "Goal Setting", "Progress Tracking"] },
  ];
}

function generateInterviewPrep(jobRole: string): { question: string; tip: string }[] {
  const role = jobRole || "your field";
  return [
    { question: `Tell me about your experience as a ${role}.`, tip: "Use the STAR method (Situation, Task, Action, Result). Focus on 2-3 concrete examples with measurable outcomes." },
    { question: "How do you handle conflicting feedback from stakeholders?", tip: "Show you balance user needs, business goals, and technical constraints. Use the 'How Might We' framework to reframe problems positively." },
    { question: "Describe a project that didn't go as planned and what you learned.", tip: "Be honest about challenges. Focus on what you learned and how you applied those lessons later. Growth mindset is key." },
    { question: `Where do you see yourself in 3 years as a ${role}?`, tip: "Align your answer with the company's direction. Show ambition balanced with realism, and connect it to the value you'd bring to their team." },
  ];
}

function generateRoadmapPhase(days: number, jobRole: string, careerGoal: string): { title: string; description: string; priority: string }[] {
  const role = jobRole || "professional";
  const goal = careerGoal || "your target role";
  if (days === 30) {
    return [
      { title: "Skills assessment & gap analysis", description: `Audit your current ${role} skills against ${goal} requirements. Identify your top 3 gaps and create a focused learning plan.`, priority: "high" },
      { title: "Portfolio audit & refresh", description: "Review your portfolio. Remove weak work, strengthen 2 case studies with metrics, and ensure your narrative is clear.", priority: "high" },
      { title: "Learning sprint", description: `Complete 1 certification or course in your top skill gap area. Apply learnings to a mini-project.`, priority: "high" },
      { title: "Network & visibility", description: "Update LinkedIn profile, join 2 professional communities, and attend 1 industry event or webinar.", priority: "medium" },
    ];
  }
  if (days === 60) {
    return [
      { title: "Deep-dive project", description: `Build a comprehensive ${role} project from scratch. Document every step: research, design, implementation, testing, and results.`, priority: "high" },
      { title: "Mentorship or collaboration", description: "Find a mentor in your target field or collaborate with a peer on a challenging problem. Get external feedback on your work.", priority: "medium" },
      { title: "Technical depth expansion", description: "Master one advanced tool or methodology relevant to your target role. Write a blog post or give a talk about it.", priority: "medium" },
      { title: "Mock interviews", description: "Complete 3 mock interviews for your target role. Record yourself, review, and iterate on weak answers.", priority: "high" },
    ];
  }
  return [
    { title: "Final portfolio polish", description: `Refine all case studies with strong metrics and compelling storytelling. Ensure your portfolio tells a cohesive career narrative.`, priority: "high" },
    { title: "Targeted applications", description: `Research 5 target companies. Tailor your CV and portfolio for each. Reach out to hiring managers or team members for informational interviews.`, priority: "high" },
    { title: "Personal brand building", description: "Publish an article, give a lightning talk, or contribute to open source. Establish yourself as a knowledgeable voice in your field.", priority: "medium" },
    { title: "Negotiation & offer prep", description: "Research salary ranges for your target role. Practice negotiation scripts and prepare your 'why' story for final interviews.", priority: "medium" },
  ];
}

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await getSupabase();

  // Verify session/user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkDistributedRateLimit(supabase, { key: `analysis:${user.id}:${getClientIp(request)}`, limit: 6, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  // Load profile by auth_id
  const { data: profiles, error: profileErr } = await supabase
    .from("user_profiles")
    .select("id, auth_id, full_name, job_role, experience_level, career_goal, github_url, linkedin_url")
    .eq("auth_id", user.id)
    .limit(1);

  if (profileErr) {
    console.error("Profile lookup failed", { message: profileErr.message });
    return NextResponse.json({ error: "Could not load profile" }, { status: 500 });
  }
  const profile = profiles?.[0];
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const jobRole = profile.job_role || "";

  // Build prompt
  const prompt = buildRoadmapPrompt({
    fullName: profile.full_name,
    jobRole,
    experienceLevel: profile.experience_level,
    careerGoal: profile.career_goal,
    skills: [],
    preferences: { language: "en", detail_level: "medium" },
  });

  // Call Foundry
  const result = await callFoundry(prompt);

  const promptHash = result.promptHash ?? crypto.createHash("sha256").update(prompt).digest("hex");

  if (!result.ok) {
    // Persist failed status in career_roadmaps
    await supabase.from("career_roadmaps").insert({
      user_profile_id: profile.id,
      career_goal: profile.career_goal,
      job_role: jobRole,
      analysis: {},
      strengths: [],
      skill_gaps: [],
      roadmap: {},
      recommended_projects: [],
      interview_prep: [],
      model_name: null,
      prompt_hash: promptHash,
      status: "failed",
      generated_at: new Date().toISOString(),
    });

    console.error("Foundry analysis request failed", { error: result.error });
    return NextResponse.json({ error: "AI analysis is temporarily unavailable" }, { status: 502 });
  }

  // Normalize with fallback
  const normalized = normalizeFoundryResponse(result.data, { jobRole, careerGoal: profile.career_goal || "" });

  // Persist completed
  const insertPayload: Record<string, unknown> = {
    user_profile_id: profile.id,
    career_goal: profile.career_goal || normalized.careerGoal || null,
    job_role: jobRole || normalized.jobRole || null,
    analysis: normalized,
    strengths: normalized.strengths || [],
    skill_gaps: normalized.skillGaps || [],
    roadmap: { "30": normalized.roadmap30, "60": normalized.roadmap60, "90": normalized.roadmap90 },
    recommended_projects: normalized.recommendedProjects || [],
    interview_prep: normalized.interviewPreparation || [],
    model_name: process.env.FOUNDRY_DEPLOYMENT || null,
    prompt_hash: promptHash,
    status: "completed",
    generated_at: new Date().toISOString(),
  };

  const { error: insertErr } = await supabase.from("career_roadmaps").insert(insertPayload);
  if (insertErr) {
    console.error("Roadmap insert failed", { message: insertErr.message });
    return NextResponse.json({ error: "Could not save roadmap" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: normalized });
}

export const GET = () => NextResponse.json({ status: "ready" });
