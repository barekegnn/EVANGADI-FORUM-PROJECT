import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex items-center justify-center h-full p-4">
        <ResetPasswordForm />
      </div>
    </Suspense>
  );
}
