import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginView } from "@/views/auth/login/login-view";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/profile");

  return <LoginView />;
}
