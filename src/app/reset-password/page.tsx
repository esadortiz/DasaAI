import { Suspense } from "react";
import { ResetPasswordView } from "@/views/auth/reset-password/reset-password-view";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
