import Link from "next/link";
import { GlassCard } from "@/components/site-shell";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.95),rgba(219,234,254,0)_70%)] blur-2xl" />
        <div className="absolute right-[-7rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.65),rgba(224,231,255,0)_68%)] blur-2xl" />
      </div>
      <GlassCard className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB]">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">The page you are looking for does not exist or was moved.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/profile" className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">Go to dashboard</Link>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 bg-white/50 px-6 text-sm font-semibold text-slate-600 backdrop-blur-md transition hover:bg-white/70 hover:text-slate-900">Go home</Link>
        </div>
      </GlassCard>
    </main>
  );
}
