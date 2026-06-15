import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RegisterView } from "@/views/auth/register/register-view";

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/profile");

  return <RegisterView />;
}
