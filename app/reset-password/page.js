"use client";
import { useSearchParams, useRouter } from "next/navigation";
import ChangePassword from "../components/ChangePassword";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const router = useRouter();

  if (!resetToken) {
    router.push("/forgot-password");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Password</h1>

        <ChangePassword token={resetToken} isResetFlow={true} />
      </div>
    </div>
  );
}