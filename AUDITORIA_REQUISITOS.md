# DasaAI — Auditoría de Requisitos Funcionales y No Funcionales

**Fecha:** Junio 2026  
**Alcance:** Revisión completa del codebase tras la integración de AI Roadmap, Coach y UX móvil.

---

## RESUMEN DE HALLAZGOS CRÍTICOS

| # | Severidad | Hallazgo |
|---|-----------|----------|
| F1 | CRÍTICO | El middleware (`proxy.ts`) jamás se ejecuta — Next.js espera `middleware.ts` con export default |
| F2 | CRÍTICO | Google OAuth rompe usuarios nuevos — los expulsa en `/auth/confirm` por lógica invertida |
| F22 | CRÍTICO | El historial del chat NUNCA se carga — solo se guarda, no se lee al volver a `/coach` |
| F37 | CRÍTICO | Sin protección CSRF en `/api/ai/analysis` y `/api/ai/chat` |
| F59 | CRÍTICO | No hay `error.tsx` (error boundary) — cualquier crash muestra pantalla blanca |
| F60 | CRÍTICO | No hay `not-found.tsx` — rutas inexistentes muestran 404 genérico de Next.js |
| F78 | CRÍTICO | Cero tests — sin unit, integración o E2E |

---

## 1. AUTENTICACIÓN

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F1 | **CRÍTICO** | `proxy.ts` exporta `proxy` con nombre, pero Next.js requiere `export default function middleware`. El archivo nunca se ejecuta. Las cookies no se refrescan automáticamente. | `src/proxy.ts:1-12` |
| F2 | **CRÍTICO** | Google OAuth rechaza usuarios nuevos. `auth/confirm/route.ts:28-46` detecta `flow=login`, verifica si el perfil se creó hace <15s (lo cual SIEMPRE es true para usuarios nuevos de Google) y los desconecta. | `src/app/auth/confirm/route.ts:28-46` |
| F3 | ALTA | Sin `onAuthStateChange` — si la sesión expira en otra pestaña, la actual no reacciona. | Todos los client components |
| F4 | MEDIA | Logout usa `NEXT_PUBLIC_SITE_URL!` sin fallback — si no está definida, crashea. | `src/app/auth/logout/route.ts:7` |
| F5 | MEDIA | Sin confirmación al cerrar sesión — clic directo = logout inmediato. | `site-shell.tsx:193` |
| F6 | BAJA | Sin redirect-after-login — el usuario siempre va a `/profile`, nunca a la página que intentaba ver. | `login-view.tsx:119` |
| F7 | BAJA | `/reset-password` puede causar flash/redirect loop al consumir el código de recuperación. | `reset-password-view.tsx:60-71` |

---

## 2. PERFIL

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F8 | ALTA | Sin `maxLength` en inputs — posible envío de MBs de texto, error en DB. | `profile-client.tsx:166-201` |
| F9 | MEDIA | URLs (GitHub, LinkedIn, Portafolio) sin validación de formato. | `profile-client.tsx:192-198` |
| F10 | MEDIA | `email` vacío en upsert rompe `CHECK (email != '')` de la DB. | `profile-client.tsx:122` |
| F11 | MEDIA | Cambiar idioma resetea `experienceLevel` al primer valor. | `profile-client.tsx:112` |
| F12 | BAJA | Sin validación inline por campo — solo un error genérico arriba. | `profile-client.tsx:163` |
| F13 | BAJA | Sin advertencia de "cambios sin guardar" al navegar fuera. | `profile-client.tsx` |

---

## 3. AI ROADMAP

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F14 | ALTA | Sin timeout en `callFoundry` — un API hung cuelga la request indefinidamente. | `lib/ai/ai-client.ts:41-53` |
| F15 | ALTA | Sin rate limiting — un usuario puede exhaustar la cuota de Foundry. | `api/ai/analysis/route.ts` |
| F16 | ALTA | `FOUNDRY_API_KEY` en `.env.local` — legible por cualquiera con acceso al filesystem. | `.env.local:4` |
| F17 | MEDIA | Sin retry para errores de red, 429, o 503 (solo reintenta por api-version). | `lib/ai/ai-client.ts:38-75` |
| F18 | MEDIA | Sin UNIQUE en `prompt_hash` — dos submits rápidos crean roadmaps duplicados. | `002_ai_features.sql` |
| F19 | MEDIA | Índice `idx_career_roadmaps_status` filtra `WHERE status='active'` pero la app consulta `status='completed'` — índice inútil. | `002_ai_features.sql:75` |
| F20 | BAJA | Sin progreso real durante análisis — solo texto estático "AI analyzing...". | `profile-client.tsx:206` |
| F21 | BAJA | Datos duplicados: mismo contenido en `analysis` JSONB y columnas separadas (`strengths`, `skill_gaps`, etc.). | `api/ai/analysis/route.ts:253-267` |

---

## 4. COACH

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F22 | **CRÍTICO** | Historial NUNCA se carga — solo se escribe en `ai_chat_history`, no se lee. Refrescar = perder todo. | `coach-client.tsx:95-102` |
| F23 | ALTA | Sin límite de mensajes — sin tope por usuario o conversación. | `coach-client.tsx:104-117` |
| F24 | MEDIA | Sin gestión de contexto — cada request envía TODO el roadmap como system prompt, sin truncar. | `api/ai/chat/route.ts:22-52` |
| F25 | MEDIA | Sin streaming/SSE — el usuario espera la respuesta completa antes de ver nada. | `api/ai/chat/route.ts` |
| F26 | MEDIA | Indicador "Typing..." es un mensaje falso que causa layout shift al reemplazarse. | `coach-client.tsx:108-115` |
| F27 | MEDIA | Sin `conversation_id` — no se puede agrupar mensajes en conversaciones ni iniciar nuevas. | `002_ai_features.sql:44-61` |
| F28 | BAJA | Sin índice compuesto `(user_profile_id, created_at DESC)` para listar historial. | `002_ai_features.sql:78-85` |
| F29 | BAJA | Quick actions sin `aria-label` ni accesibilidad por teclado. | `coach-client.tsx:163-166` |

---

## 5. MODELO DE DATOS

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F30 | ALTA | JSONB defaults son `'{}'::jsonb` pero la app almacena arrays `[]` — type mismatch. | `002_ai_features.sql:23-27` |
| F31 | MEDIA | `ai_chat_history` sin `updated_at`. | `002_ai_features.sql:44-61` |
| F32 | MEDIA | `career_roadmaps.status` sin CHECK constraint — acepta cualquier string. | `002_ai_features.sql:32` |
| F33 | BAJA | RLS de `user_profiles` permite a cualquier authenticated leer TODOS los perfiles (`USING (true)`). | `001_auth_schema.sql:192-196` |
| F34 | BAJA | `user_roles` permite INSERT a cualquier authenticated — pueden crear registros duplicados. | `001_auth_schema.sql:274-282` |
| F35 | BAJA | `audit_logs` sin RLS pero con GRANT INSERT a authenticated — cualquiera puede inyectar logs falsos. | `001_auth_schema.sql:415` |
| F36 | BAJA | Migración deprecated crea `handle_new_user()` conflictivo — tabla `profiles` huérfana si se ejecuta. | `_deprecated_001_create_profiles.sql` |

---

## 6. SEGURIDAD

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F37 | **CRÍTICO** | Sin CSRF en `/api/ai/analysis` y `/api/ai/chat` — otro sitio puede llamar estas rutas. | `api/ai/analysis/route.ts`, `api/ai/chat/route.ts` |
| F38 | ALTA | `dangerouslySetInnerHTML` con sanitización débil — posible XSS en respuestas del coach. | `coach-client.tsx:10-26,154` |
| F39 | ALTA | `FOUNDRY_API_KEY` en `.env.local` legible desde el servidor — sin gestor de secretos. | `.env.local:4` |
| F40 | MEDIA | Campos de perfil sin sanitizar antes de guardar — posible stored XSS si se renderizan con HTML. | `profile-client.tsx:120-133` |
| F41 | MEDIA | API routes usan anon key en vez de service_role para operaciones server-side (aunque funciona por RLS). | `api/ai/analysis/route.ts:10-13` |
| F42 | BAJA | Sin headers de seguridad HTTP (CSP, X-Frame-Options, HSTS). | `next.config.ts:1-5` |
| F43 | BAJA | Campos de contraseña sin toggle mostrar/ocultar. | `login-view.tsx`, `register-view.tsx` |

---

## 7. ACCESIBILIDAD

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F44 | ALTA | Casi sin ARIA — solo 1 `aria-label` en todo el app. | Todo `src/` |
| F45 | ALTA | SVG icons sin `<title>`, `aria-hidden`, o `aria-label`. | `site-shell.tsx:118-149` |
| F46 | ALTA | Sin skip-to-content link. | `site-shell.tsx` |
| F47 | MEDIA | Errores no anunciados a screen readers — sin `role="alert"` o `aria-live`. | `profile-client.tsx:163` |
| F48 | MEDIA | Sin manejo de foco tras submit — foco se queda en el botón. | Todos los formularios |
| F49 | MEDIA | Labels usan `<span>` dentro de `<label>` sin `htmlFor`/`id` explícito. | `profile-client.tsx:165-201` |
| F50 | BAJA | `<html lang="en">` hardcodeado — no cambia a `es`. | `layout.tsx:28` |
| F51 | BAJA | Contraste de color no verificado en texto gris claro sobre fondo glass. | Varios `.tsx` |

---

## 8. RENDIMIENTO

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F52 | ALTA | Sin skeleton screens — solo un spinner chiquito. CLS al cargar contenido. | Todas las páginas |
| F53 | MEDIA | Sin `dynamic()` para code splitting — todo se importa eagerly. | Todos los page files |
| F54 | MEDIA | Sin `useMemo`/`useCallback` en cálculos costosos (`phaseItems`, `score`). | `roadmap-client.tsx` |
| F55 | MEDIA | Dashboard hace fetch secuencial de profile → roadmap en vez de paralelo. | `page.tsx:121-139` |
| F56 | BAJA | Sin cache en fetch — datos se recargan en cada navegación. | Todos los `supabase.from().select()` |
| F57 | BAJA | `next.config.ts` vacío — sin optimización de imágenes, compresión, headers. | `next.config.ts:1-5` |
| F58 | BAJA | Google Fonts `Inter` cargado por `@import` CSS en vez de `next/font`. | `globals.css:1` |

---

## 9. MANEJO DE ERRORES

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F59 | **CRÍTICO** | Sin `error.tsx` — cualquier crash muestra pantalla blanca. | `src/app/error.tsx` — NO EXISTE |
| F60 | **CRÍTICO** | Sin `not-found.tsx` — rutas inválidas muestran 404 genérico. | `src/app/not-found.tsx` — NO EXISTE |
| F61 | ALTA | Chat API retorna HTTP 200 para errores — `res.ok` es true, no detectable en catch. | `api/ai/chat/route.ts:100` |
| F62 | MEDIA | Sin detección offline — errores de red sin contexto. | Todos los client components |
| F63 | MEDIA | Sin retry automático con backoff en el cliente. | `profile-client.tsx:138` |
| F64 | BAJA | Errores de Supabase mostrados crudos (`error.message`) al usuario. | `profile-client.tsx:135` |
| F65 | BAJA | Sin Sentry/error tracking en producción. | Todo el codebase |

---

## 10. UX POLISH

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F66 | MEDIA | Sin transiciones entre páginas — navegación instantánea sin feedback visual. | Todas las navegaciones |
| F67 | MEDIA | Sin confirmación antes de logout o generar roadmap. | `site-shell.tsx:193`, `profile-client.tsx:138` |
| F68 | MEDIA | Empty state del dashboard no explica qué es un roadmap ni cuánto tarda. | `page.tsx:185-189` |
| F69 | BAJA | Sin sistema de toasts/notificaciones. | Todo el codebase |
| F70 | BAJA | Botón "AI analyzing..." sin texto explicativo de lo que ocurre. | `profile-client.tsx:206` |
| F71 | BAJA | Sin scroll-to-top al navegar entre páginas largas. | Todas las páginas |

---

## 11. INTERNACIONALIZACIÓN (i18n)

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F72 | MEDIA | Preferencia de idioma no persiste — se pierde al refrescar. | `site-shell.tsx:17` |
| F73 | MEDIA | `<html lang="en">` hardcodeado sin cambiar a `es`. | `layout.tsx:28` |
| F74 | BAJA | Metadata (`<title>`, `<description>`) es boilerplate de create-next-app. | `layout.tsx:17-18` |
| F75 | BAJA | Solo 2 idiomas (en/es) — sin RTL, CJK ni formato locale-aware. | Todo el codebase |
| F76 | BAJA | Algunos textos no están en objetos de traducción (logo "D", marca "DasaAI"). | `login-view.tsx:135` |
| F77 | BAJA | Quick actions del coach usan tupla `as const` difícil de extender. | `coach-client.tsx:28-33` |

---

## 12. TESTING Y CI/CD

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F78 | **CRÍTICO** | Cero tests — sin unit, integración, o E2E. Sin dependencias de testing. | Todo el codebase |
| F79 | ALTA | Sin CI/CD — sin GitHub Actions, pre-commit hooks, lint-staged. | Sin `.github/workflows/` |
| F80 | ALTA | `types.ts` vacío — todo acceso a DB es `as Record<string, unknown>`. | `lib/supabase/types.ts` (0 líneas) |
| F81 | BAJA | `eslint` existe pero sin personalización y sin evidencia de ejecución regular. | `package.json:9` |

---

## 13. MOBILE

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F82 | MEDIA | Quick actions muy pequeños para touch (28-32px vs 44px mínimo WCAG). | `coach-client.tsx:165` |
| F83 | MEDIA | Sin selector de idioma en móvil excepto en `/profile` Settings — la mayoría de páginas no tienen. | `site-shell.tsx:186` |
| F84 | BAJA | Sin gestos swipe — sin swipe-to-dismiss ni swipe-to-navigate. | Todo el codebase |
| F85 | BAJA | `pb-safe` no aplicado en landing pública ni páginas de auth. | `page.tsx:223`, `login-view.tsx` |
| F86 | BAJA | Sin imágenes responsive con `sizes` o `priority`. | `site-shell.tsx:170` |

---

## 14. CASOS BORDE

| # | Gravedad | Problema | Ubicación |
|---|----------|----------|-----------|
| F87 | ALTA | Sin manejo de 401 en cliente — sesión expirada muestra error genérico, no redirige a login. | Todos los `fetch()` |
| F88 | MEDIA | Dos tabs pueden generar roadmap duplicado simultáneamente. | `profile-client.tsx:114-142` |
| F89 | MEDIA | Dos tabs al coach pueden enviar mensajes simultáneos sin coordinación server-side. | `coach-client.tsx:105` |
| F90 | MEDIA | Refrescar durante AI analysis = roadmap huérfano (perfil guardado, análisis perdido). | `profile-client.tsx:120-141` |
| F91 | MEDIA | Navegación back/forward muestra datos stale sin guards de formulario. | Todos los client components |
| F92 | BAJA | Abuso de `as` type assertions — riesgo de `undefined` en runtime. | Todo el codebase |
| F93 | BAJA | Sin `loading.tsx` para Suspense a nivel de ruta. | Todas las rutas |

---

## PRIORIDADES POR SEVERIDAD

### CRÍTICO (7) — Bloquean funcionalidad o exponen datos
1. **F1** — Middleware no funciona
2. **F2** — Google OAuth rompe usuarios nuevos
3. **F22** — Historial del coach no se carga
4. **F37** — Sin CSRF en APIs custom
5. **F38** — XSS potencial en mensajes del coach
6. **F59** — Sin error boundary
7. **F60** — Sin página 404
8. **F78** — Cero tests
### ALTO (12) — Riesgo de seguridad, usabilidad o estabilidad
F3, F8, F14, F15, F16, F30, F39, F44, F45, F46, F52, F61, F79, F80, F87

### MEDIO (26) — Mejora significativa de calidad
F4-F5, F9-F11, F17-F19, F23-F27, F31-F32, F40-F41, F47-F49, F53-F55, F62-F63, F66-F68, F72-F73, F82-F83, F88-F91

### BAJO (34) — Pulido y optimización
F6-F7, F12-F13, F20-F21, F28-F29, F33-F36, F42-F43, F50-F51, F56-F58, F64-F65, F69-F71, F74-F77, F81, F84-F86, F92-F93
