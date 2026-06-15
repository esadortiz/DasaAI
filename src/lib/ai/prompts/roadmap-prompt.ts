export function buildRoadmapPrompt(input: {
  fullName?: string;
  jobRole: string;
  experienceLevel?: string;
  careerGoal?: string;
  skills?: string[];
  preferences?: { language?: string; detail_level?: string };
}) {
  const { fullName, jobRole, experienceLevel, careerGoal, skills = [], preferences = {} } = input;

  const lang = preferences.language || "en";

  const userLine = `Name: ${fullName || "Professional"} | Current role: ${jobRole || "unspecified"} | Experience: ${experienceLevel || "mid-level"} | Target role: ${careerGoal || jobRole || "next level"}`;
  const skillsLine = skills.length ? `Known skills: ${skills.join(", ")}.` : "";

  const schema = `Return ONLY this exact JSON structure — no markdown, no explanation, no code fences:
{
  "summary": "2-3 sentence career overview",
  "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5", "strength6"],
  "skillGaps": [
    { "name": "Skill Name", "level": 35 },
    { "name": "Skill Name 2", "level": 25 }
  ],
  "recommendedProjects": [
    { "title": "Project Title", "description": "What to build and why", "skills": ["SkillA", "SkillB"] }
  ],
  "interviewPreparation": [
    { "question": "Interview question?", "tip": "How to answer it well" }
  ],
  "roadmap30": [ { "title": "Action", "description": "What to do", "priority": "high" } ],
  "roadmap60": [ { "title": "Action", "description": "What to do", "priority": "medium" } ],
  "roadmap90": [ { "title": "Action", "description": "What to do", "priority": "medium" } ]
}

CRITICAL RULES:
- Respond in ${lang}.
- ALL arrays must have at least 3 items. Never return empty arrays.
- skillGaps[].level is a number 0-100 representing current proficiency.
- roadmap30/60/90 must each have 4 concrete actions.
- recommendedProjects must have 3 projects with 2-3 skills each.
- interviewPreparation must have 4 question/tip pairs.
- DO NOT wrap the JSON in markdown code blocks.
- DO NOT add text before or after the JSON.
- The first character of your response MUST be { and the last MUST be }.`;

  return [schema, userLine, skillsLine].filter(Boolean).join("\n\n");
}

export default buildRoadmapPrompt;
