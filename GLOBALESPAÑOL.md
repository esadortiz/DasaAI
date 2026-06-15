# DasaAI — Documento Maestro de Requerimientos

## 1. Información General del Proyecto

### Nombre del Proyecto

**DasaAI**

### Slogan

**"Convierte tu ambición en un camino claro."**

### Descripción General

DasaAI es una plataforma impulsada por inteligencia artificial diseñada para ayudar a estudiantes, aprendices, profesionales junior, personas en búsqueda de empleo y personas que desean cambiar de carrera a construir una ruta profesional personalizada.

La plataforma funciona como un GPS profesional: analiza el perfil del usuario, identifica fortalezas, debilidades y brechas de habilidades, y genera un plan claro para alcanzar sus objetivos profesionales.

---

# 2. Problema que Resuelve

Muchas personas tienen metas profesionales pero no saben:

* Qué habilidades ya poseen.
* Qué habilidades les faltan.
* Qué deberían aprender.
* Qué proyectos deberían desarrollar.
* Cómo mejorar su hoja de vida.
* Cómo mejorar su portafolio.
* Cómo prepararse para entrevistas.
* Cómo pasar de su nivel actual al nivel profesional deseado.

---

# 3. Solución Propuesta

DasaAI ofrece:

* Análisis profesional del perfil.
* Identificación de fortalezas.
* Detección de debilidades.
* Análisis de brechas de habilidades.
* Rutas de aprendizaje personalizadas.
* Recomendación de proyectos.
* Preparación para entrevistas.
* Mejora de portafolio.
* Asistente profesional impulsado por IA.
* Coach profesional inteligente.

---

# 4. Público Objetivo

La plataforma está diseñada para:

### Estudiantes

Personas que están cursando estudios técnicos, tecnológicos o universitarios.

### Aprendices

Aprendices SENA y programas similares.

### Profesionales Junior

Personas con poca experiencia laboral.

### Personas en búsqueda de empleo

Usuarios que buscan conseguir trabajo o mejorar su empleo actual.

### Personas que desean cambiar de carrera

Usuarios que buscan migrar hacia otra profesión o industria.

### Profesionales que buscan crecimiento

Personas que desean avanzar profesionalmente.

---

# 5. Categoría de la Hackathon

### Competencia Seleccionada

**Creative Apps**

### Justificación

DasaAI es una aplicación creativa impulsada por IA que utiliza GitHub Copilot, Microsoft Foundry y agentes inteligentes para crear experiencias personalizadas de crecimiento profesional.

---

# 6. Tecnologías del Proyecto

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* App Router
* Responsive Design

## Inteligencia Artificial

* Microsoft Foundry
* DeepSeek-V3.2
* Prompt Engineering
* AI Agents

## Autenticación

* Supabase Auth
* Login con correo y contrasena

## Base de Datos

### MVP Inicial

Sin base de datos obligatoria.

### Versión Completa

* Supabase Database

## Despliegue

* Vercel

## Control de Versiones

* GitHub

## Herramientas de Desarrollo

* VS Code
* GitHub Copilot
* Copilot Chat
* Claude (planificación)
* PowerShell

---

# 7. Estructura del Proyecto

Ruta actual:

```txt
C:\Users\ASUS\Documents\dasaai
```

---

# 8. Estilo Visual

## Concepto General

La aplicación debe transmitir:

* Profesionalismo
* Innovación
* Claridad
* Tecnología
* Crecimiento profesional
* Confianza

## Estilo

* Glassmorphism
* Fondo claro
* Tarjetas translúcidas
* Diseño SaaS moderno
* Bordes redondeados
* Sombras suaves
* Apariencia premium

## Colores

### Azul Principal

```txt
#2563EB
```

### Fondo Claro

```txt
#F8FAFC
```

### Verde de Progreso

```txt
#22C55E
```

### Morado Decorativo

```txt
#7C3AED
```

### Texto Oscuro

```txt
#0F172A
```

### Texto Secundario

```txt
#64748B
```

---

# 9. Tipografía

Fuentes recomendadas:

* Inter
* Geist
* Poppins

---

# 10. Principios UX

La aplicación debe:

* Entenderse en menos de 30 segundos.
* Ser intuitiva.
* Guiar al usuario paso a paso.
* Funcionar en móviles y escritorio.
* Parecer una aplicación profesional.
* No parecer un simple chatbot.
* No parecer un formulario escolar.
* Mantener una experiencia moderna.

---

# 11. Idiomas

## Idioma Principal

Inglés

## Idioma Secundario

Español

## Selector

Debe mostrar únicamente:

```txt
EN | ES
```

No mostrar:

```txt
Language
Idioma
```

---

# 12. Rutas Principales

## Landing Page

```txt
/
```

## Perfil Profesional

```txt
/profile
```

## Roadmap Profesional

```txt
/roadmap
```

## Coach IA

```txt
/coach
```

## Login

```txt
/login
```

---

# 13. Landing Page

## Objetivo

Presentar DasaAI.

## Secciones

* Navbar
* Hero
* Beneficios
* Cómo funciona
* CTA principal
* Footer

## Botones

```txt
Get Started
Start my Roadmap
```

## Acción

Redirigir a:

```txt
/profile
```

---

# 14. Navbar

## Estilo

* Barra flotante
* Glassmorphism
* Fondo blanco translúcido
* Sombras suaves
* Diseño premium

## Menú

```txt
Home
Features
How it Works
Roadmap
Coach
```

## Botón Principal

```txt
Get Started
```

## Idioma

```txt
EN | ES
```

---

# 15. Página de Perfil

Ruta:

```txt
/profile
```

## Campos

* Nombre completo
* Área profesional
* Nivel de experiencia
* Habilidades actuales
* Objetivo profesional
* GitHub
* LinkedIn
* Portafolio
* Descripción profesional

## Botón

```txt
Generate my Roadmap
```

---

# 16. Página Roadmap

Ruta:

```txt
/roadmap
```

## Secciones

### Career Fit Score

Porcentaje de compatibilidad.

### Fortalezas

Lista de fortalezas.

### Skill Gaps

Brechas de habilidades.

### Proyectos Recomendados

Proyectos sugeridos.

### Preparación para Entrevistas

Preguntas y recomendaciones.

### Recursos de Aprendizaje

Material sugerido.

### Plan 30 / 60 / 90 Días

Ruta profesional.

---

# 17. Página Coach IA

Ruta:

```txt
/coach
```

## Funciones

* Chat profesional
* Historial
* Respuestas IA
* Acciones rápidas

## Acciones

```txt
Improve my CV
Prepare for Interview
Suggest Projects
What should I learn next?
```

---

# 18. Login

Ruta:

```txt
/login
```

## Método

Login con correo y contrasena

## Proveedor

Supabase Auth

---

# 19. Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

AZURE_FOUNDRY_ENDPOINT=
AZURE_FOUNDRY_API_KEY=
AZURE_FOUNDRY_DEPLOYMENT=
```

---

# 20. Seguridad

Nunca subir a GitHub:

```txt
.env.local
```

Nunca compartir:

* Service Role Key
* API Keys privadas
* Tokens

---

# 21. Supabase

Archivos creados:

```txt
src/lib/supabase.ts
.env.local
02_SUPABASE_LOGIN.md
```

## Autenticación

Login y registro con correo y contrasena mediante Supabase.

---

# 22. Microsoft Foundry

## Estado

Configurado correctamente.

## Modelo

```txt
DeepSeek-V3.2
```

## Proyecto

DasaAI Foundry

## Agente

DasaAI Career Navigator

---

# 23. Flujo Final del MVP

```txt
Landing
   ↓
Login Google
   ↓
Perfil Profesional
   ↓
Generar Roadmap
   ↓
Resultado Roadmap
   ↓
Coach IA
```

---

# 24. Archivos de Planificación

```txt
GLOBAL_REQUIREMENTS_ES.md

01_APP_UX_UI.md
02_AI_CONNECTIONS.md
03_TESTING_DEMO.md
04_GITHUB_SUBMISSION.md

02_SUPABASE_LOGIN.md
```

---

# 25. Estado Actual del Proyecto

## Completado

✅ Proyecto Next.js creado

✅ Tailwind configurado

✅ TypeScript configurado

✅ Landing Page creada

✅ Diseño Glassmorphism implementado

✅ Selector de idioma

✅ Página Profile

✅ Página Roadmap

✅ Página Coach

✅ Proyecto registrado en Hackathon

✅ Proyecto Microsoft Foundry creado

✅ DeepSeek-V3.2 desplegado

✅ Playground probado

## En Progreso

🔄 Login con Google

🔄 Integración Supabase

🔄 Mejoras Navbar

🔄 Conexión IA real

---

# 26. Prioridades Actuales

### Prioridad 1

Completar autenticacion con correo y contrasena.

### Prioridad 2

Configurar Supabase.

### Prioridad 3

Conectar datos entre Profile y Roadmap.

### Prioridad 4

Conectar Microsoft Foundry.

### Prioridad 5

Preparar GitHub.

### Prioridad 6

Desplegar en Vercel.

### Prioridad 7

Crear video demo.

---

# 27. Requisitos de GitHub

El repositorio debe incluir:

```txt
README.md

GLOBAL_REQUIREMENTS_ES.md

01_APP_UX_UI.md
02_AI_CONNECTIONS.md
03_TESTING_DEMO.md
04_GITHUB_SUBMISSION.md
```

---

# 28. Visión Final

DasaAI debe sentirse como:

* Un GPS profesional.
* Un coach profesional.
* Un generador de rutas de crecimiento.
* Un asistente inteligente.
* Una plataforma SaaS moderna.

No debe sentirse como:

* Un chatbot básico.
* Un generador de CV.
* Un portal de empleo genérico.
* Un formulario escolar.

---

# 29. Objetivo Final

Construir un MVP profesional para la Microsoft Agents League Hackathon que combine:

* GitHub Copilot
* Microsoft Foundry
* DeepSeek-V3.2
* Supabase
* Next.js
* UX/UI profesional

para ayudar a cualquier persona a acelerar su crecimiento profesional mediante inteligencia artificial.
