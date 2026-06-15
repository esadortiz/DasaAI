import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/security/redirects";

function redirectUrl(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) return origin + path;
  if (forwardedHost) return "https://" + forwardedHost + path;
  return origin + path;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeInternalPath(searchParams.get("next"), "/profile");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Supabase auth code exchange failed", { message: error.message });
      return NextResponse.redirect(redirectUrl(request, "/login?error=session_expired"));
    }

    return NextResponse.redirect(redirectUrl(request, next));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(redirectUrl(request, next));

    console.error("Supabase OTP verification failed", { message: error.message, type });
  }

  return NextResponse.redirect(redirectUrl(request, "/login?error=session_expired"));
}
