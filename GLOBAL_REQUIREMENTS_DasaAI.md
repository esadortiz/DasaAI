# DasaAI — Global Project Requirements

## 1. Project Name

**DasaAI**

## 2. Slogan

**Turn your ambition into a clear path.**

## 3. Project Summary

DasaAI is an AI-powered career growth platform that helps students, apprentices, junior professionals, career changers, and professionals create personalized career roadmaps.

The platform acts like a professional GPS. It analyzes the user's profile, skills, goals, experience, portfolio, and professional interests to identify strengths, weaknesses, skill gaps, and recommended next steps.

DasaAI is not only for developers or students looking for internships. It is designed for any person who wants to grow professionally, find a better opportunity, prepare for interviews, improve their portfolio, or plan a clear career path.

---

## 4. Main Problem

Many people have professional goals but do not know:

- What skills they already have.
- What skills they are missing.
- What they should learn next.
- What projects they should build.
- How to improve their CV or portfolio.
- How to prepare for interviews.
- How to move from their current level to their desired professional goal.

---

## 5. Proposed Solution

DasaAI provides:

- Professional profile analysis.
- Skill gap detection.
- Personalized career roadmaps.
- Suggested projects.
- Portfolio improvement guidance.
- Interview preparation.
- AI career coach assistance.
- Learning path recommendations.

---

## 6. Target Users

DasaAI is designed for:

- Students.
- Apprentices.
- Junior professionals.
- Job seekers.
- Career changers.
- Professionals who want to grow.
- People preparing for internships.
- People preparing for their first job.
- People looking for career advancement.

---

## 7. Hackathon Track

**Creative Apps**

Reason:

DasaAI is a creative AI-powered web application that uses GitHub Copilot, Microsoft Foundry, AI agents, and modern web technologies to create personalized professional growth experiences.

---

## 8. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
- Responsive design
- Glassmorphism UI

### Backend / APIs

- Next.js API routes planned for AI connection
- Supabase planned for authentication
- Microsoft Foundry for AI model integration

### Authentication

- Supabase Auth
- Email and password login
- Environment variables through `.env.local`

### AI

- Microsoft Foundry
- DeepSeek-V3.2 deployed in Foundry
- AI Agent saved as DasaAI Career Navigator
- Prompt engineering
- Future AI connection from app to Foundry API

### Database

Current phase:

- No database required for first UI MVP.

Planned:

- Supabase database for storing user profiles, roadmaps, and analysis history.

### Deployment

Planned:

- Vercel

### Version Control

Planned:

- GitHub public repository

### Development Tools

- VS Code
- GitHub Copilot Free
- Copilot Chat
- Copilot instructions/skills
- Claude for planning only
- PowerShell

---

## 9. Current Project Path

```txt
C:\Users\ASUS\Documents\dasaai
```

---

## 10. Created / Planned Markdown Files

The project is organized with phase-based Markdown files:

```txt
01_APP_UX_UI.md
02_SUPABASE_LOGIN.md
03_AI_CONNECTIONS.md
04_TESTING_DEMO.md
05_GITHUB_SUBMISSION.md

```

### Purpose

#### 01_APP_UX_UI.md
Defines UX/UI design, screens, components, colors, layout, and visual requirements.

#### 02_AI_CONNECTIONS.md
Defines Microsoft Foundry, DeepSeek-V3.2, API connections, prompts, and AI behavior.

#### 03_TESTING_DEMO.md
Defines testing flow, demo scenarios, user journeys, and video preparation.

#### 04_GITHUB_SUBMISSION.md
Defines GitHub upload, README, repository structure, architecture diagram, and hackathon submission checklist.

#### 02_SUPABASE_LOGIN.md
Defines Supabase login setup with Google provider.

---

## 11. Design Style

### Main Style

- Light glassmorphism.
- White translucent cards.
- Blue as the main accent color.
- Subtle purple only for background decoration.
- Rounded corners.
- Soft shadows.
- Premium SaaS look.
- Clean and modern.
- Inspired by modern mobile apps and fintech-style UI.

### Main Color Direction

- White / translucent glass cards.
- Blue primary buttons.
- Blue active states.
- Soft blue gradients.
- Subtle purple background glow only if needed.

### Color Tokens

```txt
Primary Blue: #2563EB
Light Background: #F8FAFC
Glass White: rgba(255, 255, 255, 0.72)
Dark Text: #0F172A
Secondary Text: #64748B
Progress Green: #22C55E
Subtle Purple: #7C3AED
```

### Typography

Recommended:

- Inter
- Geist
- Poppins

---

## 12. UX Principles

The application must:

- Be understandable in less than 30 seconds.
- Clearly guide the user from landing to profile creation.
- Avoid looking like a simple school form.
- Avoid looking like only a chatbot.
- Feel like a real SaaS product.
- Be fully responsive on desktop and mobile.
- Keep the interface clean, professional, and modern.
- Show AI as a guide, not just a text generator.
- Avoid exposing internal development notes in the UI.

Do not show UI text such as:

- "No backend"
- "No auth"
- "Only UI"
- "Phase 1"
- "Preview"
- "Implementation details"

Those notes belong only in Markdown planning files, not in the user interface.

---

## 13. Language Requirements

The app must support:

- English as default language.
- Spanish as optional language.

The navbar should show only:

```txt
EN | ES
```

Do not show words like:

```txt
Language
Idioma
```

---

## 14. Main Routes

The app should not place everything in a single page. It must use separate App Router pages:

```txt
/              Landing Page
/profile       Professional Profile Form
/roadmap       Visual AI Roadmap Result
/coach         AI Career Coach
/login         Supabase email/password login
/register      Supabase email/password registration
/forgot-password Password recovery request
/reset-password  Password reset
```

---

## 15. Landing Page Requirements

Route:

```txt
/
```

Purpose:

Present DasaAI as a professional AI-powered career growth platform.

Sections:

- Floating glass navbar.
- Hero section.
- Benefits.
- How it works.
- Microsoft Foundry / GitHub Copilot mention.
- CTA to start profile.
- Footer.

Main CTA:

```txt
Get Started
Start my roadmap
```

CTA behavior:

- Navigate to `/profile`.

---

## 16. Header / Navbar Requirements

Style:

- Floating rounded pill navbar.
- White/glass background.
- Soft shadow.
- Clean spacing.
- Premium SaaS look.
- Blue primary CTA button.

Navbar items:

```txt
Home
Features
How it works
Roadmap
Coach
```

CTA button:

```txt
Get Started
```

Language toggle:

```txt
EN | ES
```

Important:

- No empty black pill.
- Active item must show text clearly.
- Do not overcrowd the header.
- Do not mix languages in the same active UI state.

---

## 17. Profile Page Requirements

Route:

```txt
/profile
```

Purpose:

Collect the user's professional information.

Fields:

- Full name.
- Current role or area.
- Experience level.
- Current skills.
- Career goal.
- GitHub URL.
- LinkedIn URL.
- Portfolio URL.
- Profile description.

Current behavior:

- Uses local state.
- No backend yet.
- No database yet.
- Button generates local preview or navigates to roadmap.

Button:

```txt
Generate my roadmap
```

Expected next behavior:

- Navigate to `/roadmap` with demo/static data first.
- Later connect to Microsoft Foundry.

---

## 18. Roadmap Page Requirements

Route:

```txt
/roadmap
```

Purpose:

Show a visual AI-style career analysis result.

Sections:

- Career Fit Score.
- Goal.
- Current Level.
- Focus Area.
- Strengths.
- Skill Gaps.
- Recommended Projects.
- Interview Preparation.
- Learning Resources.
- 30 / 60 / 90 Day Roadmap.

Current phase:

- Static/demo data.

Future phase:

- Real AI response from Microsoft Foundry.

---

## 19. Coach Page Requirements

Route:

```txt
/coach
```

Purpose:

Show a professional AI Career Coach chat interface.

Required elements:

- AI avatar.
- User messages.
- Coach messages.
- Message history.
- Message input.
- Send button.
- Quick action buttons.

Quick actions:

```txt
Improve my CV
Prepare for interview
Suggest projects
What should I learn next?
```

Current phase:

- Static/demo messages.
- Simulated responses.

Future phase:

- Connected to Microsoft Foundry / DeepSeek-V3.2.

---

## 20. Login Requirements

Route:

```txt
/login
```

Provider:

- Supabase Auth with email and password.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Important:

- Use only the `anon public` key.
- Never use the `service_role` key in frontend.
- Never expose secret keys in GitHub.
- `.env.local` must be ignored by Git.

Login behavior:

- Sign in with email and password.
- Redirect to `/profile` after successful login.
- Landing page remains public.
- Protected app routes redirect unauthenticated users to `/login`.

---

## 21. Supabase Files

Created / planned:

```txt
src/lib/supabase.ts
.env.local
02_SUPABASE_LOGIN.md
```

Supabase package:

```txt
@supabase/supabase-js
```

---

## 22. Microsoft Foundry Setup

Already completed:

- Azure for Students account used.
- Microsoft Foundry resource created.
- DasaAI Foundry project created.
- DeepSeek-V3.2 deployed successfully.
- Playground tested successfully.
- DasaAI agent saved.

Model:

```txt
DeepSeek-V3.2
```

Example system instruction:

```txt
You are DasaAI, an AI career growth assistant. You help users analyze their profile, identify strengths, weaknesses, skill gaps, and create personalized career roadmaps.
```

---

## 23. AI Example Output

The AI should generate results like:

- Strengths.
- Areas of opportunity.
- 3-month learning roadmap.
- Recommended stack.
- Portfolio project ideas.
- Job/internship search strategy.
- Interview preparation.

---

## 24. Copilot Usage Requirement

The hackathon requires meaningful use of GitHub Copilot.

Evidence to document:

- Copilot Chat used for UI generation.
- Copilot used for debugging.
- Copilot used to refactor pages into routes.
- Copilot used to build glassmorphism UI.
- Copilot used to create Supabase setup.
- Copilot used to improve roadmap and coach pages.

---

## 25. Copilot Skill / Instructions Files

Local skill files used or planned:

```txt
.github/skills/awesome-design-md/SKILL.md
.github/skills/ui-ux-pro-max/SKILL.md
.github/instructions/design-skill.instructions.md
```

Purpose:

- Improve UX/UI decisions.
- Keep design consistent.
- Guide Copilot to create premium SaaS UI.
- Avoid generic chatbot layouts.

---

## 26. Current Completed Work

Completed:

- Next.js project created.
- Tailwind CSS configured.
- TypeScript configured.
- Local development server working.
- Landing page created.
- Glassmorphism design applied.
- Language toggle added.
- Profile form created.
- Roadmap page created.
- Roadmap page improved with visual sections.
- Coach page improved with chat interface.
- Microsoft Foundry resource created.
- DeepSeek-V3.2 deployed.
- Foundry playground tested.
- Hackathon project created.
- Creative Apps challenge selected.
- Supabase preparation started.

In progress:

- Supabase credentials configuration.
- Google login setup.
- Header/navbar final polish.
- Connecting app flow between profile and roadmap.
- Connecting real AI API.

---

## 27. Current Priorities

### Priority 1
Fix and polish the header/navbar.

### Priority 2
Finish Supabase email/password authentication setup.

### Priority 3
Connect `/profile` to `/roadmap` using local/demo data.

### Priority 4
Connect `/coach` and `/roadmap` to Microsoft Foundry API.

### Priority 5
Prepare GitHub repository and final documentation.

---

## 28. MVP Flow

Final MVP flow:

```txt
Landing
   ↓
Login with Google
   ↓
Profile Form
   ↓
Generate Roadmap
   ↓
Roadmap Result
   ↓
AI Career Coach
```

For demo purposes, login may remain optional if time is short.

---

## 29. Environment Variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

AZURE_FOUNDRY_ENDPOINT=
AZURE_FOUNDRY_API_KEY=
AZURE_FOUNDRY_DEPLOYMENT=
```

Security:

- Never upload `.env.local` to GitHub.
- Never expose service role keys.
- Never paste secret keys in public chats.
- Add `.env.local` to `.gitignore`.

---

## 30. GitHub Requirements

The hackathon requires:

- Public GitHub repository.
- Source code.
- Project description.
- Architecture diagram.
- Demo video.
- Challenge linked to Creative Apps.

Repository should include:

```txt
README.md
GLOBAL_REQUIREMENTS.md
01_APP_UX_UI.md
02_AI_CONNECTIONS.md
03_TESTING_DEMO.md
04_GITHUB_SUBMISSION.md
```

---

## 31. README Requirements

README should include:

- Project name.
- Description.
- Problem.
- Solution.
- Features.
- Tech stack.
- Microsoft Foundry integration.
- GitHub Copilot usage.
- How to run locally.
- Environment variables.
- Screenshots.
- Demo video link.
- Team members.

---

## 32. Architecture Diagram Requirements

The architecture should show:

```txt
User
 ↓
Next.js Web App
 ↓
Profile Form / Roadmap / Coach
 ↓
Supabase Auth
 ↓
Microsoft Foundry API
 ↓
DeepSeek-V3.2 Model
 ↓
AI Career Analysis Output
```

Optional:

```txt
Vercel Deployment
GitHub Repository
```

---

## 33. Demo Video Requirements

Maximum:

```txt
5 minutes
```

Demo flow:

1. Introduce DasaAI.
2. Explain the problem.
3. Show landing page.
4. Login with Google.
5. Complete profile form.
6. Generate roadmap.
7. Show roadmap analysis.
8. Open AI Career Coach.
9. Explain Microsoft Foundry and GitHub Copilot usage.
10. Close with impact.

---

## 34. Submission Checklist

Before submitting:

- App works locally.
- App deployed on Vercel.
- GitHub repo public.
- README complete.
- No secret keys in GitHub.
- Demo video uploaded.
- Architecture diagram uploaded.
- Project linked to Creative Apps.
- Foundry integration explained.
- Copilot usage documented.

---

## 35. Important Decisions

### Decision 1
Use **Next.js + TypeScript + Tailwind CSS**.

### Decision 2
Use **glassmorphism light UI**.

### Decision 3
Use **blue as the main accent color**.

### Decision 4
Use **English as default** and **Spanish as optional**.

### Decision 5
Use **Supabase email/password authentication**.

### Decision 6
Use **Microsoft Foundry + DeepSeek-V3.2** for AI.

### Decision 7
Keep first version simple and functional before adding complex database features.

---

## 36. Do Not Do Yet

Do not add yet:

- Payments.
- Complex database logic.
- Admin dashboard.
- Complex user roles.
- Heavy animations.
- Enterprise-level route protection.
- Too many unnecessary pages.
- Dark-only UI.
- Internal development notes in the UI.

---

## 37. Next Immediate Tasks

1. Fix navbar final design.
2. Complete Supabase `.env.local`.
3. Enable Google provider in Supabase.
4. Create `/login` page if not fully completed.
5. Test login.
6. Connect profile form to roadmap with local state or URL/session storage.
7. Prepare AI API connection file.
8. Connect Foundry model.
9. Test full flow.
10. Push to GitHub.

---

## 38. Project Identity

**DasaAI** represents a career growth assistant built with AI. The name comes from the team identity and is intended to feel short, modern, and easy to remember.

Brand message:

```txt
DasaAI helps people discover where they are, where they want to go, and the clearest path to get there.
```

---

## 39. Final Product Vision

DasaAI should feel like:

- A professional GPS.
- A career coach.
- A learning planner.
- A portfolio improvement assistant.
- An AI roadmap generator.
- A modern SaaS platform.

It should not feel like:

- A simple chatbot.
- A school form.
- A generic CV generator.
- A basic job board.

---

## 40. Final Goal

Build a polished MVP for the Microsoft Agents League Hackathon that demonstrates:

- Creative AI application.
- Professional UX/UI.
- GitHub Copilot-assisted development.
- Microsoft Foundry integration.
- Real-world career growth value.
