# DasaAI UX/UI REFACTOR URGENTE (HACKATHON)

## Objetivo

DasaAI ya funciona técnicamente:

* Login con Supabase ✅
* Perfil ✅
* Roadmap IA ✅
* Coach IA ✅
* Microsoft Foundry + DeepSeek ✅

Ahora necesitamos mejorar la experiencia de usuario.

La aplicación debe sentire como una APP móvil moderna, no como una landing con formularios.

NO modificar:

* Supabase
* IA
* Foundry
* Endpoints
* Base de datos
* Lógica del roadmap
* Lógica del coach

Modificar únicamente UX/UI y flujo de navegación.

---

# NUEVA ESTRUCTURA

## Navegación móvil

Eliminar la navegación actual basada en menú superior para móvil.

Crear una Bottom Navigation fija.

Items:

🏠 Inicio
🗺️ Roadmap
🤖 Coach
👤 Perfil

La navegación inferior debe permanecer visible en móvil.

En desktop mantener navbar superior.

---

# NUEVA PANTALLA INICIO

Crear una experiencia tipo dashboard.

Mostrar:

Hola, {nombre}

Rol actual

Objetivo profesional

Score del roadmap

Próxima acción recomendada

Progreso del roadmap

Accesos rápidos:

* Ver Roadmap
* Hablar con Coach
* Actualizar Perfil

Eliminar elementos decorativos innecesarios.

El usuario debe entender su situación en menos de 5 segundos.

---

# REDISEÑO DE PROFILE

Problema actual:

Se solicitan demasiados datos obligatorios.

No todos los usuarios son desarrolladores.

GitHub no aplica para todos.

Portafolio no aplica para todos.

LinkedIn no aplica para todos.

---

## Nuevo flujo Profile

Campos obligatorios:

Nombre completo

Área profesional

Nivel de experiencia

Objetivo profesional

Nada más.

Botón:

Continuar

---

## Información adicional opcional

Mostrar sección opcional:

"Mejora tu análisis"

Campos opcionales:

LinkedIn

GitHub

Portafolio

CV

No obligatorios.

---

## Campos dinámicos

Si el usuario selecciona:

Tecnología

mostrar:

GitHub
Portafolio
LinkedIn

---

Diseño UX/UI

Menos formulario.

Más velocidad.

El usuario debe generar un roadmap en menos de 60 segundos.

---

# REDISEÑO DE ROADMAP

Mostrar primero:

1. Objetivo profesional

2. Score

3. Próxima acción

4. Plan 30/60/90

Luego:

Fortalezas

Brechas

Proyectos recomendados

Preguntas de entrevista

No mostrar información duplicada.

No mostrar placeholders vacíos.

---

# REDISEÑO DE COACH

Convertir la pantalla en experiencia chat-first.

Priorizar:

Conversación

Campo de mensaje

Botón enviar

Quick Actions:

* Mejorar CV
* Prepararme para entrevista
* Buscar prácticas
* Sugerir proyectos

Eliminar bloques que ocupen espacio sin aportar valor.

---

# RESPONSIVE

Mobile First.

Debe verse primero como aplicación móvil.

Tablet:

Cards en 2 columnas.

Desktop:

Dashboard limpio.

No estirar la versión móvil.

---

# LIMPIEZA GENERAL

Eliminar:

Cards duplicadas

Summaries repetidos

Previews innecesarios

Texto redundante

Bloques que no aportan valor

---

# IMPORTANTE

Antes de programar:

1. Indícame exactamente qué archivos vas a modificar.

2. Explica la nueva estructura UX propuesta.

3. Después implementa.

4. Ejecuta build.

5. Reporta todos los archivos modificados.
