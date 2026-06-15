import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoachClient } from "./coach-client";

export default async function CoachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <CoachClient user={user} />;
}