"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  copy: (typeof content)[Language];
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const value = useMemo(() => ({ language, setLanguage, copy: content[language] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const content = {
  en: {
    appName: "DasaAI",
    auth: {
      signIn: "Sign in",
      signOut: "Sign out",
      profile: "Profile",
      confirmSignOut: "Are you sure you want to sign out?",
      createAccount: "Create account",
      forgotPassword: "Forgot my password",
      fullName: "Full name",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      sendRecoveryLink: "Send recovery link",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      checkEmail: "Check your email",
      emailRegistered: "Email already registered",
      invalidCredentials: "Invalid credentials",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password is too short",
      sessionExpired: "Session expired",
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      features: "Features",
      process: "How it works",
      roadmap: "Roadmap",
      coach: "Coach",
      profile: "Profile",
      cta: "Get Started",
    },
  },
  es: {
    appName: "DasaAI",
    auth: {
      signIn: "Iniciar sesion",
      signOut: "Cerrar sesion",
      profile: "Perfil",
      confirmSignOut: "Seguro que quieres cerrar sesion?",
      createAccount: "Crear cuenta",
      forgotPassword: "Olvide mi contrasena",
      fullName: "Nombre completo",
      email: "Correo electronico",
      password: "Contrasena",
      confirmPassword: "Confirmar contrasena",
      sendRecoveryLink: "Enviar enlace de recuperacion",
      newPassword: "Nueva contrasena",
      confirmNewPassword: "Confirmar nueva contrasena",
      checkEmail: "Revisar correo",
      emailRegistered: "Correo ya registrado",
      invalidCredentials: "Credenciales incorrectas",
      passwordMismatch: "Las contrasenas no coinciden",
      passwordTooShort: "Contrasena demasiado corta",
      sessionExpired: "Sesion expirada",
    },
    nav: {
      home: "Inicio",
      dashboard: "Dashboard",
      features: "Funciones",
      process: "Como funciona",
      roadmap: "Roadmap",
      coach: "Coach",
      profile: "Perfil",
      cta: "Comenzar",
    },
  },
} as const;

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-[0_8px_24px_rgba(37,99,235,0.08)] backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8]" />
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"glass-surface rounded-[20px] p-6 " + className}>{children}</div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-2xl bg-white/60 " + className} />;
}

const NavIcon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d={d} />
  </svg>
);

const GlobeIcon = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const publicNavItems = [
  { key: "home", href: "/", iconD: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { key: "features", href: "/#features", iconD: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" },
  { key: "process", href: "/#process", iconD: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L10.41 23.4a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
];

const authNavItems = [
  { key: "profile", href: "/profile", iconD: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { key: "roadmap", href: "/roadmap", iconD: "M1 6v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2zm4 4h14M5 14h10" },
  { key: "coach", href: "/coach", iconD: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
];

const bottomNavItems = [
  { key: "home", href: "/", iconD: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { key: "roadmap", href: "/roadmap", iconD: "M1 6v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2zm4 4h14M5 14h10" },
  { key: "coach", href: "/coach", iconD: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { key: "profile", href: "/profile", iconD: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

export function ShellHeader({
  language,
  setLanguage,
  copy,
  user,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: (typeof content)[Language];
  user?: { id?: string; email?: string | null; user_metadata?: { full_name?: string } } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const items = user ? authNavItems : publicNavItems;
  const logoHref = user ? "/profile" : "/";
  const confirmSignOut = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!window.confirm(copy.auth.confirmSignOut)) event.preventDefault();
  };

  return (
    <header className="glass-surface sticky top-4 z-20 mx-4 hidden rounded-full px-3 py-3 shadow-[0_8px_32px_rgba(37,99,235,0.10)] sm:px-4 lg:flex">
      <div className="flex w-full items-center gap-3 sm:gap-4">
        <Link href={logoHref} className="flex shrink-0 items-center">
          <Image src="/img/logo-DasaAI.png" alt="DasaAI" width={100} height={32} className="h-8 w-auto object-contain" />
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {items.map(({ key, href, iconD }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const label = copy.nav[key as keyof typeof copy.nav] || key;
            return (
              <Link key={key} href={href} className={"inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition duration-200 " + (isActive ? "bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-lg shadow-blue-500/20" : "text-slate-600 hover:bg-white/60 hover:text-slate-900")}>
                <NavIcon d={iconD} />{label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => setLanguage(language === "en" ? "es" : "en")} className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/50 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 shadow-[0_4px_12px_rgba(37,99,235,0.06)] backdrop-blur-md transition duration-200 hover:bg-white/70 hover:text-slate-900 lg:flex" aria-label="Toggle language">
            <GlobeIcon />
          </button>

          {user ? (
            <>
              <span className="hidden text-xs font-medium text-slate-700 sm:inline">{user.user_metadata?.full_name ?? user.email ?? ""}</span>
              <button type="button" onClick={() => setShowSignOutModal(true)} className="inline-flex h-9 items-center justify-center rounded-full border border-white/60 bg-white/50 px-3 text-xs font-semibold text-slate-600 shadow-[0_4px_12px_rgba(37,99,235,0.06)] backdrop-blur-md transition duration-200 hover:bg-white/70 hover:text-slate-900">{copy.auth.signOut}</button>
            </>
          ) : (
            <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-4 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 sm:px-5 sm:text-sm">{copy.auth.signIn}</Link>
          )}
        </div>
      </div>

      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSignOutModal(false)}>
          <div className="glass-surface mx-4 w-full max-w-sm rounded-[24px] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l4-4-4-4m4 4H9" /></svg>
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-950">{language === "en" ? "Sign out?" : "Cerrar sesion?"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{language === "en" ? "Are you sure you want to sign out?" : "Seguro que quieres cerrar sesion?"}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowSignOutModal(false)} className="flex-1 rounded-full border border-white/70 bg-white/50 py-2.5 text-sm font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/70">{language === "en" ? "Cancel" : "Cancelar"}</button>
              <button type="button" onClick={() => router.push("/auth/logout")} className="flex-1 rounded-full bg-gradient-to-r from-red-500 to-red-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5">{copy.auth.signOut}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function BottomNav({
  copy,
  user,
}: {
  language: Language;
  copy: (typeof content)[Language];
  user?: { id?: string; email?: string | null; user_metadata?: { full_name?: string } } | null;
}) {
  const pathname = usePathname();
  if (!user) return null;

  return (
    <nav className="glass-surface fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/50 px-2 py-2 lg:hidden">
      {bottomNavItems.map(({ key, href, iconD }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const label = copy.nav[key as keyof typeof copy.nav] || key;
        return (
          <Link key={key} href={href} className={"flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition " + (isActive ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={iconD} /></svg>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
