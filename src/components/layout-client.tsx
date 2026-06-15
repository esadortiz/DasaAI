"use client";

import { type ReactNode } from "react";
import { AuthStateListener } from "./auth-state-listener";
import { LanguageProvider } from "./site-shell";

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthStateListener />
      <div id="main-content">{children}</div>
    </LanguageProvider>
  );
}
