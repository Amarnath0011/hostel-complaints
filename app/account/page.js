"use client";
import { useState, useEffect } from "react";
import { getStoredUser, clearUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ChangePassword from "../components/ChangePassword";

export default function Account() {
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const router = useRouter();

  useEffect(() => {
    const u = getStoredUser();
    if (!u) router.push("/login");
    setUser(u);
  }, [router]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    ///api/account/change-password
    toast.success("Password updated successfully!");
    setPasswords({ current: "", new: "" });
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure? This will delete all your complaints and data permanently.");
    if (confirmed) {
      //api/account/delete
      clearUser();
      router.push("/");
      toast.error("Account deleted.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      {/* 1. Profile Info Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
            <p className="text-gray-800 font-medium">{user.name}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">College Email</label>
            <p className="text-gray-800 font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <ChangePassword />

      {/* 3. Danger Zone Card */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-red-600 mb-4">
          Once you delete your account, there is no going back. All your complaint history will be wiped.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}