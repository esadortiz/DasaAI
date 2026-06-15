# 01_APP_UX_UI.md — DasaAI UX/UI Design Plan

> Plan de diseño completo para implementar con GitHub Copilot.
> Sin backend, sin base de datos, sin autenticación. Solo UI funcional.

---

## 1. Objetivo de Diseño

Crear una interfaz web moderna, premium y clara que transmita:

- **Confianza** — el usuario siente que está en una herramienta profesional seria
- **Inteligencia** — la IA se percibe como un guía, no como un formulario
- **Claridad** — cada pantalla tiene un propósito obvio en menos de 10 segundos
- **Movimiento suave** — transiciones y efectos que dan vida sin distraer

La experiencia debe sentirse como una app SaaS de nivel internacional: limpia, rápida, y visualmente impresionante desde el primer scroll.

---

## 2. Estilo Visual

**Glassmorphism moderno sobre fondo claro.**

El glassmorphism en fondo claro funciona con capas de vidrio blanco translúcido sobre un gradiente suave. No es oscuro ni opaco — es luminoso, etéreo y premium.

### Reglas de estilo

| Elemento | Regla |
|---|---|
| Fondo general | Gradiente claro: blanco a azul muy pálido |
| Cards | `backdrop-filter: blur` + fondo blanco con 60–80% opacidad |
| Bordes | `1px solid rgba(255,255,255,0.6)` — borde de vidrio |
| Sombras | `box-shadow` suave con color azul o morado tenue |
| Bordes redondeados | `border-radius: 20px` en cards, `12px` en inputs, `999px` en buttons |
| Superficies | Nunca sólidas — siempre translúcidas o con gradiente suave |
| Íconos | Lucide Icons — trazo fino, monocromo |
| Animaciones | `transition: all 0.3s ease` — suaves, nunca bruscas |

---

## 3. Paleta de Colores

### Base

| Nombre | Valor | Uso |
|---|---|---|
| `bg-base` | `#F0F4FF` | Fondo general de la app |
| `bg-gradient-start` | `#FFFFFF` | Inicio del gradiente de fondo |
| `bg-gradient-end` | `#EEF2FF` | Final del gradiente (azul muy pálido) |

### Glassmorphism

| Nombre | Valor | Uso |
|---|---|---|
| `glass-white` | `rgba(255,255,255,0.70)` | Cards principales |
| `glass-white-soft` | `rgba(255,255,255,0.45)` | Cards secundarias, overlays |
| `glass-border` | `rgba(255,255,255,0.60)` | Borde de vidrio en cards |
| `glass-shadow` | `0 8px 32px rgba(99,102,241,0.10)` | Sombra suave con tinte morado |

### Colores de marca

| Nombre | Valor | Uso |
|---|---|---|
| `brand-blue` | `#2563EB` | Botones primarios, links, acentos |
| `brand-purple` | `#7C3AED` | Gradientes de IA, badges, highlights |
| `brand-blue-light` | `#DBEAFE` | Fondos de tags, chips, badges |
| `brand-purple-light` | `#EDE9FE` | Fondos alternativos suaves |
| `brand-green` | `#22C55E` | Progreso, éxito, checks |

### Texto

| Nombre | Valor | Uso |
|---|---|---|
| `text-primary` | `#0F172A` | Títulos principales |
| `text-secondary` | `#475569` | Subtítulos, descripciones |
| `text-muted` | `#94A3B8` | Labels, placeholders, hints |
| `text-white` | `#FFFFFF` | Texto sobre botones o fondos oscuros |

### Gradientes de marca

```css
/* Botón principal */
background: linear-gradient(135deg, #2563EB, #7C3AED);

/* Hero background blob */
background: radial-gradient(ellipse at top left, #DBEAFE 0%, transparent 60%),
            radial-gradient(ellipse at bottom right, #EDE9FE 0%, transparent 60%);

/* Badge IA */
background: linear-gradient(135deg, #7C3AED20, #2563EB20);
```

---

## 4. Tipografía

**Fuente principal:** `Inter` (Google Fonts)
**Fuente alternativa:** `Poppins` para headings si se quiere más personalidad

```html
<!-- En el <head> de index.html o layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Escala tipográfica

| Rol | Tamaño | Peso | Uso |
|---|---|---|---|
| `display` | `56px / 3.5rem` | 800 | Título hero |
| `h1` | `40px / 2.5rem` | 700 | Títulos de sección |
| `h2` | `28px / 1.75rem` | 700 | Subtítulos de sección |
| `h3` | `20px / 1.25rem` | 600 | Títulos de card |
| `body-lg` | `18px / 1.125rem` | 400 | Texto principal |
| `body` | `16px / 1rem` | 400 | Texto general |
| `small` | `14px / 0.875rem` | 400 | Labels, hints |
| `xs` | `12px / 0.75rem` | 500 | Badges, chips |

---

## 5. Pantallas del MVP

### Pantalla 1 — Landing Page

**Propósito:** Capturar la atención y convertir al visitante en usuario en menos de 30 segundos.

**Secciones:**

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
│  Logo  |  Features · About · Pricing    │
│                           [Get Started] │
├─────────────────────────────────────────┤
│  HERO SECTION                           │
│                                         │
│  Badge: "AI-Powered Career Growth"      │
│                                         │
│  Your AI Career                         │
│  Growth Navigator                       │
│                                         │
│  Subtitle — 1 línea clara               │
│                                         │
│  [Start my roadmap →]  [See how →]      │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Dashboard Mockup (glass card)   │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  BENEFITS — 3 cards en fila             │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Card │  │ Card │  │ Card │          │
│  └──────┘  └──────┘  └──────┘          │
├─────────────────────────────────────────┤
│  HOW IT WORKS — 4 pasos con número      │
├─────────────────────────────────────────┤
│  CTA FINAL — "Ready to start?"          │
├─────────────────────────────────────────┤
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

---

### Pantalla 2 — Formulario de Perfil

**Propósito:** Recolectar la información del usuario de forma simple y no intimidante.

**Estructura:**

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├─────────────────────────────────────────┤
│  Header de sección                      │
│  "Tell us about yourself"               │
│  Subtitle: step indicator (1 de 3)      │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │  GLASS CARD — Formulario         │   │
│  │                                  │   │
│  │  Name                            │   │
│  │  [________________________]      │   │
│  │                                  │   │
│  │  Profession / Area of interest   │   │
│  │  [________________________]      │   │
│  │                                  │   │
│  │  Current level                   │   │
│  │  [Student ▼]                     │   │
│  │                                  │   │
│  │  Career goal                     │   │
│  │  [________________________]      │   │
│  │                                  │   │
│  │  Current skills (tags)           │   │
│  │  [+ Add skill]                   │   │
│  │                                  │   │
│  │  GitHub URL                      │   │
│  │  [________________________]      │   │
│  │                                  │   │
│  │  LinkedIn URL                    │   │
│  │  [________________________]      │   │
│  │                                  │   │
│  │  About you / CV description      │   │
│  │  [                          ]    │   │
│  │  [                          ]    │   │
│  │                                  │   │
│  │  [Generate my roadmap →]         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

### Pantalla 3 — Resultado del Análisis IA

**Propósito:** Mostrar el análisis generado de forma visual, clara y organizada.

**Estructura:**

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├─────────────────────────────────────────┤
│  Header: "Your Career Analysis"         │
│  Nombre del usuario · Goal badge        │
├─────────────────────────────────────────┤
│  ROW 1 — 3 cards pequeñas               │
│  ┌───────────┐ ┌──────────┐ ┌─────────┐ │
│  │Strengths  │ │Weaknesses│ │ Level   │ │
│  └───────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────┤
│  ROW 2 — Skill Gap                      │
│  ┌──────────────────────────────────┐   │
│  │  Skills que tienes ✅            │   │
│  │  Skills que te faltan ❌         │   │
│  │  Progress bar por skill          │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ROW 3 — Roadmap 30/60/90               │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 30d  │  │ 60d  │  │ 90d  │          │
│  └──────┘  └──────┘  └──────┘          │
├─────────────────────────────────────────┤
│  ROW 4 — Proyectos sugeridos            │
├─────────────────────────────────────────┤
│  ROW 5 — Interview Prep tips            │
├─────────────────────────────────────────┤
│  CTA: [Talk to my AI Coach →]           │
└─────────────────────────────────────────┘
```

---

### Pantalla 4 — AI Career Coach (Chat)

**Propósito:** Permitir conversación continua con el agente de IA.

**Estructura:**

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├──────────────┬──────────────────────────┤
│  SIDEBAR     │  CHAT AREA               │
│              │                          │
│  Profile     │  ┌────────────────────┐  │
│  summary     │  │ Mensaje IA         │  │
│              │  └────────────────────┘  │
│  Quick tips  │                          │
│              │       ┌────────────────┐ │
│  · Improve   │       │ Mensaje user   │ │
│    my CV     │       └────────────────┘ │
│  · Interview │                          │
│    prep      │  ┌────────────────────┐  │
│  · Projects  │  │ Mensaje IA         │  │
│  · What to   │  └────────────────────┘  │
│    learn     │                          │
│              │  [Quick suggestions]     │
│              │  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│              │  └──┘ └──┘ └──┘ └──┘   │
│              │                          │
│              │  ┌──────────────────┐    │
│              │  │ Type a message…  │ →  │
│              │  └──────────────────┘    │
└──────────────┴──────────────────────────┘
```

---

## 6. Componentes Necesarios

Listados en orden de dependencia (los primeros son base para los siguientes):

### Globales
- `globals.css` — variables CSS, reset, tipografía base
- `layout.tsx` — wrapper principal con fondo gradiente

### Átomos (elementos base)
- `Button` — variantes: `primary` (gradiente), `secondary` (glass), `ghost`
- `Input` — estilo glass con borde translúcido y focus suave
- `Textarea` — misma línea visual que Input
- `Select` — dropdown estilizado
- `Badge` — chip pequeño con variantes: blue, purple, green, gray
- `SkillTag` — tag removible para el formulario de skills

### Moléculas (combinación de átomos)
- `GlassCard` — contenedor base glass con blur, borde, sombra y border-radius
- `Navbar` — logo + links + CTA button
- `Footer` — links + copyright
- `StepIndicator` — barra de progreso de pasos del formulario
- `ProgressBar` — barra de progreso para skill gap
- `RoadmapDayCard` — card de 30/60/90 días con lista de tareas
- `StrengthItem` — ítem con ícono ✅ y descripción
- `WeaknessItem` — ítem con ícono ⚠️ y descripción
- `ProjectCard` — card de proyecto sugerido
- `ChatBubble` — burbuja de mensaje (variante user / AI)
- `QuickSuggestionChip` — botón rápido en el chat

### Organismos (secciones completas)
- `HeroSection` — título + subtítulo + CTAs + mockup
- `BenefitsSection` — 3 cards de beneficios
- `HowItWorksSection` — pasos numerados
- `CTASection` — llamada a la acción final
- `ProfileForm` — formulario completo de perfil
- `AnalysisResult` — resultado completo del análisis
- `ChatInterface` — sidebar + area de chat + input

---

## 7. Orden Exacto de Implementación

### Sprint 1 — Base del proyecto
1. Crear proyecto Next.js con TypeScript y Tailwind CSS
2. Configurar `globals.css` con variables CSS de la paleta y tipografía Inter
3. Configurar `tailwind.config.ts` con colores y valores custom de la paleta
4. Crear `layout.tsx` con fondo gradiente y fuente Inter aplicada

### Sprint 2 — Componentes base (átomos)
5. Crear componente `Button` con variantes primary, secondary y ghost
6. Crear componente `Input` estilo glass
7. Crear componente `Textarea` estilo glass
8. Crear componente `Badge` con variantes de color
9. Crear componente `GlassCard` — el componente más reutilizado de la app

### Sprint 3 — Navbar y Footer
10. Crear `Navbar` con logo, links y botón CTA
11. Crear `Footer` simple con links y copyright

### Sprint 4 — Landing Page
12. Crear `HeroSection` con título, subtítulo, CTAs y mockup card
13. Crear `BenefitsSection` con 3 GlassCards
14. Crear `HowItWorksSection` con pasos numerados
15. Crear `CTASection` con bloque final de conversión
16. Ensamblar página `page.tsx` (Landing) con todas las secciones

### Sprint 5 — Formulario de Perfil
17. Crear `SkillTag` y lógica de añadir/remover skills con estado local
18. Crear `StepIndicator` para mostrar progreso del formulario
19. Crear `ProfileForm` con todos los campos y validación básica de UI
20. Crear página `/profile` que renderiza el formulario

### Sprint 6 — Pantalla de Resultados
21. Crear `ProgressBar` para skill gap
22. Crear `RoadmapDayCard` para 30/60/90 días
23. Crear `ProjectCard` para proyectos sugeridos
24. Crear `AnalysisResult` con todas las secciones ensambladas
25. Crear página `/result` con datos de prueba (mock data estático)

### Sprint 7 — Chat del Agente
26. Crear `ChatBubble` con variantes user y AI
27. Crear `QuickSuggestionChip`
28. Crear `ChatInterface` con sidebar, área de chat y input
29. Implementar lógica de chat con estado local (mock sin backend)
30. Crear página `/chat`

### Sprint 8 — Pulido final
31. Revisar responsive design en todas las pantallas (mobile first)
32. Agregar animaciones de entrada con `transition` y `opacity`
33. Agregar estados de loading (skeleton o spinner glass)
34. Revisar consistencia visual en todas las pantallas
35. Prueba completa del flujo: Landing → Form → Result → Chat

---

## 8. Prompts para GitHub Copilot

Usar estos prompts en orden. Cada uno corresponde a un paso del Sprint anterior.

---

### PROMPT 01 — Setup del proyecto

```
Create a Next.js 14 project with TypeScript and Tailwind CSS.
Configure tailwind.config.ts with these custom colors:
- brand-blue: #2563EB
- brand-purple: #7C3AED
- brand-green: #22C55E
- brand-blue-light: #DBEAFE
- brand-purple-light: #EDE9FE
- text-primary: #0F172A
- text-secondary: #475569
- text-muted: #94A3B8
- bg-base: #F0F4FF

In globals.css, import Inter from Google Fonts and set it as the default font.
Set the body background to a soft gradient from white to #EEF2FF.
```

---

### PROMPT 02 — GlassCard component

```
Create a reusable React component called GlassCard in /components/ui/GlassCard.tsx.

It should be a div with:
- background: rgba(255, 255, 255, 0.70)
- backdrop-filter: blur(16px)
- border: 1px solid rgba(255, 255, 255, 0.60)
- border-radius: 20px
- box-shadow: 0 8px 32px rgba(99, 102, 241, 0.10)
- padding: 24px

Accept className and children as props.
Use TypeScript.
```

---

### PROMPT 03 — Button component

```
Create a Button component in /components/ui/Button.tsx with three variants:

1. primary: gradient background from #2563EB to #7C3AED, white text, rounded-full, px-6 py-3
2. secondary: glass style — white background 70% opacity, border rgba(255,255,255,0.6), text #0F172A, rounded-full
3. ghost: transparent background, text #2563EB, underline on hover

All variants should have: font-semibold, smooth hover transition (0.2s), cursor-pointer.
Accept variant, children, onClick, className, and type props.
Use TypeScript.
```

---

### PROMPT 04 — Input component

```
Create an Input component in /components/ui/Input.tsx with glassmorphism style.

Styles:
- background: rgba(255, 255, 255, 0.60)
- border: 1px solid rgba(255, 255, 255, 0.50)
- border-radius: 12px
- padding: 12px 16px
- font-size: 16px
- color: #0F172A
- placeholder color: #94A3B8
- on focus: border-color #2563EB, box-shadow 0 0 0 3px rgba(37,99,235,0.15)
- transition: all 0.2s ease

Accept all standard HTML input props plus an optional label string.
If label is provided, render it above the input in text-sm font-medium text-secondary.
Use TypeScript.
```

---

### PROMPT 05 — Navbar

```
Create a Navbar component in /components/layout/Navbar.tsx.

Layout: fixed top, full width, height 64px.
Background: rgba(255,255,255,0.80) with backdrop-filter blur(12px).
Border-bottom: 1px solid rgba(255,255,255,0.60).

Left: Logo — "DasaAI" in bold, gradient text from #2563EB to #7C3AED.
Center: navigation links — Features, How it works, About. Hidden on mobile.
Right: Button "Get Started" with primary gradient variant.

Use Next.js Link for navigation.
Make it responsive: hide center links on mobile, show hamburger icon placeholder.
Use TypeScript.
```

---

### PROMPT 06 — HeroSection

```
Create a HeroSection component in /components/sections/HeroSection.tsx.

Structure:
1. Small badge at top: pill shape, gradient background rgba of blue/purple, text "AI-Powered Career Growth ✨"
2. Main title (h1): "Your AI Career Growth Navigator" — large, bold, #0F172A, with "Growth Navigator" in gradient blue to purple
3. Subtitle: one line description of DasaAI, text-secondary color, max-width 600px, centered
4. Two buttons side by side: primary "Start my roadmap →" and ghost "See how it works"
5. Below buttons: a GlassCard mockup showing a fake dashboard preview with some colored bars and text placeholders

Center everything. Add a soft radial gradient background blob behind the hero.
Use TypeScript and the GlassCard and Button components already created.
```

---

### PROMPT 07 — BenefitsSection

```
Create a BenefitsSection component in /components/sections/BenefitsSection.tsx.

Show 3 GlassCards in a responsive grid (1 col mobile, 3 cols desktop).

Each card contains:
- An emoji or Lucide icon at the top in a rounded square with brand-blue-light background
- A bold title (h3)
- A short description in text-secondary

Card 1: icon Brain/🧠, title "AI Career Analysis", description about identifying strengths and gaps
Card 2: icon Map/🗺️, title "Personalized Roadmap", description about 30/60/90 day plans
Card 3: icon MessageCircle/💬, title "AI Career Coach", description about the conversational assistant

Add a section title above: "Everything you need to grow" centered.
Use TypeScript.
```

---

### PROMPT 08 — HowItWorksSection

```
Create a HowItWorksSection component in /components/sections/HowItWorksSection.tsx.

Show 4 steps in a horizontal row on desktop, vertical on mobile.
Between each step on desktop, show a small arrow → connector.

Each step:
- Circle with step number (1, 2, 3, 4) — gradient background blue to purple, white text
- Bold title below the number
- Short description in text-secondary

Step 1: "Define your goal" — tell us where you want to go
Step 2: "Share your profile" — add your skills, experience, links
Step 3: "Get your analysis" — AI analyzes your profile instantly  
Step 4: "Follow your roadmap" — execute the personalized plan

Add section title above: "How DasaAI works" centered.
Use TypeScript.
```

---

### PROMPT 09 — ProfileForm

```
Create a ProfileForm component in /components/forms/ProfileForm.tsx.

Use a GlassCard as wrapper. Show a StepIndicator at the top showing step 1 of 1.

Fields (use the Input component):
- Name (text)
- Profession or area of interest (text)
- Current level (select: Student, Junior, Mid-level, Senior, Career changer)
- Career goal (text)
- Current skills — tag input: user types a skill, presses Enter or clicks "+", skill appears as a removable Badge chip below the input
- GitHub URL (text, optional)
- LinkedIn URL (text, optional)
- About you / CV description (Textarea, 4 rows)

At the bottom: primary Button "Generate my roadmap →" full width.

Manage all field state with useState. On submit, console.log the form data for now.
Use TypeScript.
```

---

### PROMPT 10 — AnalysisResult page

```
Create an AnalysisResult component in /components/sections/AnalysisResult.tsx.

Use this static mock data to populate the UI:
- Name: "Alex Johnson"
- Goal: "UX Designer Senior"
- Strengths: ["Visual Design", "Figma", "Prototyping"]
- Weaknesses: ["UX Research", "User Testing", "Portfolio"]
- Skills owned: ["Figma ✅", "UI Design ✅", "Wireframing ✅"]
- Skills missing: ["UX Research ❌", "Usability Testing ❌", "Case Studies ❌"]
- 30-day plan: 3 bullet points
- 60-day plan: 3 bullet points
- 90-day plan: 3 bullet points
- Suggested project: "Redesign a real app and document the full UX process"

Layout:
- Top: greeting "Here's your career analysis, Alex" with goal badge
- Row of 3 small GlassCards: Strengths, Weaknesses, Current Level
- Full-width GlassCard: Skill Gap with two columns and ProgressBars
- 3 GlassCards side by side: 30 / 60 / 90 day roadmap
- GlassCard: Suggested project
- CTA button at bottom: "Talk to my AI Coach →"

Use TypeScript.
```

---

### PROMPT 11 — ChatInterface

```
Create a ChatInterface component in /components/chat/ChatInterface.tsx.

Layout: two columns — sidebar (280px fixed) + main chat area.

Sidebar (GlassCard):
- User avatar placeholder (circle with initials)
- User name and goal
- Section title "Quick actions"
- List of 4 clickable chips: "Improve my CV", "Prepare me for an interview", "Suggest projects", "What should I learn next?"

Chat area:
- Scrollable message list
- Each message is a ChatBubble — user messages align right (blue background), AI messages align left (glass white)
- AI messages show a small "DasaAI" label above them
- At the bottom: a glass Input field with a send button (arrow icon)

State:
- messages: array of {role: 'user' | 'ai', text: string}
- Start with one initial AI message: "Hi! I'm your AI Career Coach. How can I help you today?"
- On send: add user message to state, then add a mock AI reply after 800ms delay
- Clicking a quick action chip populates and sends that message

Use TypeScript and useState.
```

---

### PROMPT 12 — Responsive review

```
Review all components and pages in this Next.js project for mobile responsiveness.

Ensure:
- Navbar hides center links on screens smaller than md (768px)
- All grid layouts use 1 column on mobile and expand on md/lg
- GlassCards have padding 16px on mobile, 24px on desktop
- HeroSection title is 36px on mobile, 56px on desktop
- ChatInterface stacks sidebar above chat on mobile (flex-col)
- All buttons are full width on mobile when inside forms
- Font sizes scale down gracefully on small screens

Apply Tailwind responsive prefixes (sm:, md:, lg:) where needed.
Do not change the visual style or colors — only fix layout and sizing for mobile.
```

---

*Plan generado para DasaAI — Implementar con GitHub Copilot en orden secuencial.*
*Cada prompt es autónomo y referencia componentes creados en prompts anteriores.*
