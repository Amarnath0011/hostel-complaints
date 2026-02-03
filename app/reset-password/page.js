"use client";
import { useSearchParams, useRouter } from "next/navigation";
import ChangePassword from "../components/ChangePassword";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const router = useRouter();

  if (!userId) {
    router.push("/forgot-password");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Password</h1>

        <ChangePassword userId={userId} isResetFlow={true} />
      </div>
    </div>
  );
}