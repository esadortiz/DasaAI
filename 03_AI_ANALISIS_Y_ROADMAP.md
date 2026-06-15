# 03_AI_ANALISIS_Y_ROADMAP

Fecha: 2026-06-10
Proyecto: DasaAI

Resumen: Documento de planificación para pasar el Roadmap y el Coach de respuestas simuladas a análisis y asistente impulsados por IA real. Incluye arquitectura propuesta, flujo de datos, estructura de respuestas, criterios de almacenamiento, y checklist de implementación.

---

1. Objetivo general de la fase

- Convertir las funcionalidades de `Roadmap` y `Coach` desde respuestas simuladas a servicios impulsados por modelos de IA (LLMs) de producción.
- Generar análisis personalizados usando datos del usuario para producir: plan 30/60/90, tareas accionables, y recomendaciones de aprendizaje.
- Exponer una API interna server-side que produzca y almacene resultados en Supabase y permita consumo SSR/SSG y client-side mínimo.
- Mantener compatibilidad con la arquitectura SSR ya existente y conservar Google + email/password como autenticación.


2. Arquitectura propuesta

- Cliente (Next.js App Router): rutas existentes `/roadmap`, `/coach`, `/profile`, formularios y vistas.
- Server-side (Next.js server functions / server components): endpoints server-only que actúan como fachada para llamadas a la IA (`/api/ai/analysis`, `/api/ai/chat`).
- AI Client Layer: `src/lib/ai/ai-client.ts` (abstracción para provider: OpenAI, Azure Foundry, o endpoint privado). Gestiona llamadas, retries, timeouts, y trazabilidad.
 - AI Client Layer: `src/lib/ai/ai-client.ts` (abstracción para el proveedor oficial: Microsoft Foundry — DeepSeek-V3.2). Gestiona llamadas, retries, timeouts, y trazabilidad.
- AI Service Layer: `src/services/ai/analysis.ts` y `src/services/ai/chat.ts` — orquestan preparación de prompt, encolado si aplica, post-procesado y validación de respuesta.
- Persistencia Supabase: tabla(s) existentes si aplican o nuevas tablas optativas `ai_analysis` y `ai_chat_history` (ver sección 7). Inicialmente se prefieren columnas JSONB en tablas existentes o `user_profiles.preferences` para evitar migraciones.
- Workers / Background: Opcional — para tareas largas (fine-tuning, batch scoring) usar Jobs o funciones edge. Inicialmente llamadas sincrónicas con timeouts conservadores.

Diagrama lógico (alto nivel):

User -> Next.js Server (SSR route /api/ai/analysis) -> AI Client -> Modelo (Azure/Provider) -> Server post-procesa -> Guarda en Supabase -> Cliente lee y renderiza


3. Flujo completo del usuario

- Usuario autenticado (Google o email) inicia en `/profile` y pulsa `Generar Roadmap`.
- Frontend hace POST a server route `POST /api/ai/analysis` (server-only) con `user_id` (no enviar keys confidenciales desde cliente).
- Server valida sesión con `createServerClient()` y carga `user_profiles` relevantes.

**Ajustes obligatorios antes de implementar**

- Proveedor oficial: `Microsoft Foundry` con `DeepSeek-V3.2`.
- Variables servidor obligatorias (solo entorno servidor):
  - `FOUNDRY_ENDPOINT`
  - `FOUNDRY_API_KEY`
  - `FOUNDRY_DEPLOYMENT`
- No exponer claves en frontend bajo ninguna circunstancia.
- Fuente principal del perfil: `user_profiles`, campo `job_role` (normalizar valores si es necesario).
- Antes de crear tablas nuevas, verificar existencia de `career_roadmaps` y `ai_chat_history`.
- Si las tablas `career_roadmaps` o `ai_chat_history` no existen, proponer una migración separada (no ejecutar todavía).

- El primer código a implementar tras la aprobación será:
  1. `src/lib/ai/ai-client.ts`
  2. `src/app/api/ai/analysis/route.ts`

- Server prepara el prompt + input data y llama a la IA (ai-client).
- Modelo devuelve respuesta estructurada JSON (ver sección 6).
- Server valida y guarda la respuesta en Supabase (`ai_analysis` o `user_profiles.analysis` JSONB) con metadatos (model, prompt hash, timestamp).
- Frontend redirige / presenta la vista `/roadmap` con datos generados; el `Coach` puede reutilizar el análisis para contextualizar conversaciones (por ejemplo: `ai_chat_history` con references a analysis_id).


4. Datos que se tomarán desde `user_profiles`

- `id` (perfil interno)
- `auth_id` (uid supabase)
- `full_name`
- `email` (solo si es necesario para personalización mínima)
- `job_role` (o `current_role`) — campo clave para contexto profesional
- `experience_level`
- `career_goal`
- `current_skills` (si existe en perfil; de lo contrario `[]`)
- `profileDescription` / `bio`
- `github_url`, `linkedin_url` (opcional: para inferir seniority o proyectos)
- `is_active`, `is_onboarded` (para decidir si sugerir onboarding steps)
- Preferencias (`user_preferences.preferences` JSONB) — idioma, nivel de detalle

Nota: Nunca enviar PII sensible ni service_role keys. Enviar sólo lo necesario para el prompt.


5. Datos que se enviarán al modelo de IA

- Contexto mínimo (JSON):
  - `user`: { `id`, `full_name` (opcional), `job_role`, `experience_level`, `career_goal` }
  - `skills`: array de strings
  - `constraints`: { `time_horizon`: "30/60/90", `preferred_learning_format`: "projects|courses|reading" }
  - `preferences`: { `language`, `detail_level`: "short|medium|detailed" }
  - `system_instructions`: Pauta fija para el modelo (tono profesional, formato JSON estricto, no inventar links)
  - `examples`: 1-2 examples small (optional) para few-shot

- Payload final: `{ "task": "generate_roadmap", "user": {...}, "skills": [...], "constraints": {...}, "preferences": {...} }`

Nota: El proveedor oficial será Microsoft Foundry (DeepSeek-V3.2). Los prompts, límites de tokens y el formateo JSON deben ajustarse a las recomendaciones de Foundry.


6. Estructura esperada de la respuesta de IA

Requerir respuesta JSON pura (si el proveedor no puede garantizarlo, envolver con delimitadores y validar). Esquema propuesto:

{
  "analysis_id": "uuid-v4-or-hash",
  "summary": "Resumen ejecutivo en 2-3 frases",
  "confidence": 0.0-1.0, // opcional
  "roadmap": [
    { "phase": "30", "title": "Objetivo corto plazo", "description": "...", "actions": [ { "title": "", "estimate_hours": 4, "resources": ["url"], "priority": "high|medium|low" } ] },
    { "phase": "60", ... },
    { "phase": "90", ... }
  ],
  "skills_gap": [ { "skill": "X", "level_current": "intermediate", "level_target": "advanced", "recommended_actions": ["project","course"] } ],
  "suggested_projects": [ { "title":"Project A", "description":"...", "steps": [...] } ],
  "metadata": { "model": "DeepSeek-V3.2", "provider": "Microsoft Foundry", "model_version": "v1", "prompt_hash": "sha256...", "generated_at": "ISO8601" }
}

Validaciones a aplicar en servidor:
- Esquema JSON válido
- `roadmap` contiene 3 fases (30/60/90) o mapa alternativo
- `analysis_id` único dentro del proyecto (hash del prompt + user id + timestamp posible)


7. Cómo almacenar los resultados en Supabase

Estrategias (ordenadas por preferencia mínima invasiva):

1) Minimizar cambios: Añadir columna `analysis JSONB` a `user_profiles` o usar `user_preferences.preferences.analysis` para guardar el JSON de análisis. Antes de proponer nuevas tablas, verificar si existen las tablas `career_roadmaps` y `ai_chat_history` en la base de datos del proyecto y reusarlas si encajan con el modelo de datos. Ventaja: evita nuevas tablas. Desventaja: tamaño por fila si se generan muchos análisis (versionado difícil).

2) Tabla dedicada (recomendada en largo plazo, pero requiere migración aprobada): `ai_analysis`
  - id BIGSERIAL
  - user_id BIGINT REFERENCES user_profiles(id)
  - analysis_id TEXT UNIQUE
  - payload JSONB
  - model TEXT
  - prompt_hash TEXT
  - created_at timestamptz default now()
  - status VARCHAR (completed|failed|pending)
  - visibility/public BOOLEAN (default false)

3) Chat history tabla opcional: `ai_chat_history` (si se quiere persistir conversaciones del coach). **Antes de crear** esta tabla, comprobar si `ai_chat_history` ya existe y si `career_roadmaps` puede almacenar referencias a `analysis_id` para evitar duplicación.

Recomendación inicial: Usar opción (1) para pruebas rápidas y (2) después de validación para producción. Cualquier migración a tablas nuevas debe ser aprobada y aplicada por migrations controladas (no automática desde UI).


8. Cómo consumir los resultados desde: Roadmap

- `/roadmap` server component debe intentar leer primeramente `ai_analysis` (o columna `user_profiles.analysis`).
- Si existe un análisis reciente (configurable: 7 días), mostrarlo y permitir `Regenerar roadmap`.
- Renderizar JSON siguiendo la estructura: resumen, fases 30/60/90, cada acción con etiquetas, estimación y links.
- Proveer botones de export (PDF, Markdown) y acciones rápidas (marcar como completada, añadir a calendario).
- Si no existe análisis, mostrar CTA para `Generar Roadmap` que lanza la petición server-side.


9. Cómo consumir los resultados desde: Coach

- `Coach` debe reutilizar el `analysis.analysis_id` y `roadmap` como contexto inicial para conversaciones.
- Al iniciar chat, el servidor puede inyectar un contexto system-message breve con `summary` del análisis y `top 3 actions`.
- Guardar conversación en `ai_chat_history` con referencia a `analysis_id`.
- Cuando el coach responde, puede sugerir acciones específicas sacadas de `roadmap.actions` y enlazarlas.


10. Archivos que deberán crearse

(Implementación fase 1 - pruebas y POC)

- `03_AI_ANALISIS_Y_ROADMAP.md` (documento — creado)
- `src/lib/ai/ai-client.ts` — adaptador para Microsoft Foundry (DeepSeek-V3.2)
- `src/services/ai/analysis.ts` — orquestador de prompts y validaciones
- `src/services/ai/chat.ts` — orquestador para chat/coach
- `src/app/api/ai/analysis/route.ts` — endpoint server-side para generar análisis
- `src/app/api/ai/chat/route.ts` — endpoint server-side para chat (POST messages)
- `src/lib/ai/prompts/*` — plantillas y examples

(Implementación fase 2 - almacenamiento y producción, si se aprueba migración)

- `src/db/migrations/YYYYMMDD_create_ai_analysis_table.sql` — opcional (requiere justificación). **Antes de aplicar** migración, ejecutar chequeo: `SELECT to_regclass('public.career_roadmaps'), to_regclass('public.ai_chat_history');` y revisar esquema.


11. Archivos que deberán modificarse

- `src/app/roadmap/page.tsx` — consumir `ai_analysis` en SSR (usar `user_profiles.job_role` como fuente principal de contexto para prompts)
- `src/app/coach/page.tsx` — inyectar contexto de análisis y persistir chat (reutilizar `analysis_id`/`roadmap`)
- `src/lib/supabase/server.ts` — revisar timeouts y uso correcto de createServerClient si se necesitan tokens adicionales para operaciones server-side específicas (sin service_role en cliente público)
- `src/views/auth/register/register-view.tsx` — *no cambiar para este ticket* (mantener)
- `src/components/site-shell.tsx` — añadir enlaces o UI pequeños para `Regenerar Roadmap`


12. Orden exacto de implementación paso a paso

Fase 0 — Preparación (no disruptiva)
1. Crear este documento `03_AI_ANALISIS_Y_ROADMAP.md` (completado).
2. Crear `src/lib/ai/ai-client.ts` con interfaz vacía y mocks, configurado específicamente para Microsoft Foundry (DeepSeek-V3.2) usando `process.env.FOUNDRY_ENDPOINT` y `process.env.FOUNDRY_API_KEY` en entorno servidor. Añadir tests unitarios básicos.
3. Crear `src/services/ai/analysis.ts` y `src/services/ai/chat.ts` con lógica de preparación de prompt y validación mínima de JSON.
4. Crear endpoint server: `src/app/api/ai/analysis/route.ts` que:
   - Valida sesión con `createServerClient()`
   - Carga `user_profiles` fields necesarios
   - Llama a `analysis.ts` y devuelve resultado (sin persistir inicialmente, o guardando en `user_profiles.analysis` según configuración)
5. Integrar `/roadmap` para leer del endpoint y mostrar resultado. En primera iteración, almacenamiento en `user_profiles.analysis` (no se requieren migraciones).
6. Realizar pruebas E2E locales con un proveedor de IA de pruebas (mock o sandbox).

Fase 1 — Persistencia y Harden
7. Revisar resultados; si validación OK, proponer migración para crear tabla `ai_analysis`. Crear migración en `src/db/migrations` y plan de rollout.
8. Implementar guardado robusto en `ai_analysis` y usar `status` para reintentos.
9. Añadir `ai_chat_history` tabla y endpoints para persistir conversaciones del coach.

Fase 2 — UX y optimizaciones
10. Añadir paginación, versiones del análisis, y UI para seleccionar análisis previos.
11. Añadir background worker para regeneraciones y batching.
12. Monitorización: métricas de latencia, costos del modelo, y alertas de fallos.


13. Riesgos y validaciones

Riesgos:
- Costos de llamadas al modelo (mitigar: top-k tokens, temperatura baja, caching).
- Respuestas no estructuradas o hallucinations.
- Latencia (timeout en SSR): usar procesos asíncronos o jobs para tareas largas.
- Privacidad/PII: no enviar datos sensibles al modelo; minimizar PII.
- RLS y permisos: asegúrate que las funciones server-side usan `createServerClient()` y no exponen keys.

Validaciones:
- Validar JSON schema en servidor con `zod` o `ajv`.
- Mantener prompt hashing para reproducibilidad.
- Pruebas unitarias de prompts y post-procesado.
- Pruebas E2E con datos mock y con un pequeño set de usuarios reales.


14. Cómo mantener compatibilidad con el diseño actual

- Usar los mismos componentes `GlassCard`, `SectionBadge`, y estilos existentes para presentar resultados.
- Mantener esquema de colores y layout; solo sustituir datos de muestra por datos IA.
- Añadir estados de carga y mensajes claros cuando el análisis esté en proceso o fallido.
- No alterar rutas existentes; añadir botones secundarios (`Regenerar`) y banners informativos.


15. Qué información reutilizará el Coach desde el análisis generado

- `analysis_id` para referencia y contexto.
- `summary` y `top 3 acciones` como system prompt para conversación.
- `skills_gap` para priorizar preguntas y recomendaciones.
- `suggested_projects` para crear ejercicios o pasos conversacionales.


16. Checklist final de pruebas

- [ ] Unit tests para `ai-client` y validación de esquema JSON.
- [ ] Test de integración del endpoint `/api/ai/analysis` con mocks del proveedor.
- [ ] Prueba manual: Generar roadmap para 3 usuarios con distintos `job_role` y `experience_level`.
- [ ] UI tests: `/roadmap` rendering con datos reales y sin datos.
- [ ] Prueba de regresión: login, register, logout, profile flows sin ruptura.
- [ ] Verificación de RLS: las consultas server-side deben respetar permisos.
- [ ] Pruebas de rendimiento: latencia < 5s para respuestas simples; fallback asíncrono si excede.
- [ ] Seguridad: confirmar que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es el único key usado en frontend; no exponer `service_role`.


---

Resumen exacto de archivos que serán afectados en esta fase (implementación inicial y futura, listado propuesto):

- Creado: `03_AI_ANALISIS_Y_ROADMAP.md` (este documento)
- Crear: `src/lib/ai/ai-client.ts` (nuevo)
- Crear: `src/services/ai/analysis.ts` (nuevo)
- Crear: `src/services/ai/chat.ts` (nuevo)
- Crear: `src/app/api/ai/analysis/route.ts` (nuevo endpoint server)
- Crear: `src/app/api/ai/chat/route.ts` (nuevo endpoint server)
- Modificar: `src/app/roadmap/page.tsx` (consumo SSR del análisis)
- Modificar: `src/app/coach/page.tsx` (inyectar contexto del análisis)
- Modificar: `src/components/site-shell.tsx` (UI: Regenerar Roadmap botón)
- Opcional (requiere aprobación de migración): `src/db/migrations/YYYYMMDD_create_ai_analysis_table.sql` (nuevo)

Notas finales:
- No se crearán tablas nuevas sin aprobación formal; la fase inicial usa persistencia mínima no disruptiva (columna JSONB o `user_preferences`).
- Si apruebas, procedo a diseñar `ai-client` y el endpoint `api/ai/analysis` y a ejecutar pruebas con la configuración de proveedor que prefieras.


---

Documento generado por: Equipo DasaAI — Plan de IA para Roadmap & Coach
