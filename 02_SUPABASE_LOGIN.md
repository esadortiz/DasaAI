# 02_SUPABASE_LOGIN.md — DasaAI Supabase Auth Integration Plan

> Plan de integración con Supabase para autenticación y base de datos.
> Fase 2 del MVP: agregar login, registro y persistencia de datos.

---

## 1. Objetivo

Conectar DasaAI a Supabase para habilitar:

- Registro de usuarios (email + contraseña)
- Inicio de sesión (email + contraseña)
- Persistencia de sesión (refresh tokens)
- Perfil de usuario guardado en base de datos
- Análisis y roadmaps guardados por usuario
- Historial de chat persistente

---

## 2. Dependencias

```bash
npm install @supabase/supabase-js
```

---

## 3. Configuración de Supabase

### 3.1 Crear proyecto en Supabase

1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Ir a Settings > API
4. Copiar `Project URL` y `anon public key`

### 3.2 Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 3.3 Cliente Supabase (`src/lib/supabase.ts`)

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4. Esquema de Base de Datos (SQL)

Ejecutar en el SQL Editor de Supabase:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  current_role TEXT,
  experience_level TEXT,
  career_goal TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  profile_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de análisis guardados
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  fit_score INTEGER,
  strengths JSONB,
  skill_gaps JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de roadmaps guardados
CREATE TABLE roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  roadmap_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. Pantallas de Auth

### 5.1 Login Page (`/login`)

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────────┐         │
│         │  GLASS CARD         │         │
│         │                     │         │
│         │  DasaAI             │         │
│         │  Welcome back       │         │
│         │                     │         │
│         │  Email              │         │
│         │  [______________]   │         │
│         │                     │         │
│         │  Password           │         │
│         │  [______________]   │         │
│         │                     │         │
│         │  [Sign In →]        │         │
│         │                     │         │
│         │  No account?        │         │
│         │  Create one →       │         │
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Register Page (`/register`)

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────────┐         │
│         │  GLASS CARD         │         │
│         │                     │         │
│         │  DasaAI             │         │
│         │  Create account     │         │
│         │                     │         │
│         │  Full name          │         │
│         │  [______________]   │         │
│         │                     │         │
│         │  Email              │         │
│         │  [______________]   │         │
│         │                     │         │
│         │  Password           │         │
│         │  [______________]   │         │
│         │                     │         │
│         │  [Create Account →] │         │
│         │                     │         │
│         │  Already have one?  │         │
│         │  Sign in →          │         │
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 6. Componentes Necesarios

### Auth
- `AuthForm` — formulario compartido de login/register
- `AuthGuard` — wrapper que redirige a /login si no hay sesión
- `UserMenu` — dropdown en el navbar con avatar, nombre, logout

### Hooks
- `useAuth` — hook que expone: user, session, signIn, signUp, signOut, loading

---

## 7. Flujo de Auth

```
Usuario visita /profile
  → AuthGuard verifica sesión
  → Si no hay sesión → redirect a /login
  → Login exitoso → redirect a /profile
  → Perfil completado → redirect a /roadmap

Usuario visita /login
  → Si ya tiene sesión → redirect a /roadmap
  → Si no → muestra formulario de login
```

---

## 8. Orden de Implementación

1. Configurar proyecto Supabase (dashboard)
2. Crear tablas SQL
3. Configurar `.env.local` con credenciales reales
4. Instalar `@supabase/supabase-js`
5. Crear `src/lib/supabase.ts`
6. Crear hook `useAuth`
7. Crear página `/login`
8. Crear página `/register`
9. Crear `AuthGuard` y proteger rutas
10. Conectar `/profile` a Supabase (guardar datos)
11. Cargar datos reales en `/roadmap` desde Supabase
12. Conectar `/coach` a historial persistente

---

*Plan generado para DasaAI — Fase 2: Supabase Auth.*
