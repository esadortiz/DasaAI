"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const protectedRoutes = ["/profile", "/roadmap", "/coach"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function AuthStateListener() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") return;

      if (event === "SIGNED_OUT") {
        if (isProtectedPath(pathname)) {
          const query = window.location.search.replace(/^\?/, "");
          const next = pathname + (query ? "?" + query : "");
          router.replace("/login?next=" + encodeURIComponent(next));
          return;
        }

        router.refresh();
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
