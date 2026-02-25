"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ChangePassword from "../components/ChangePassword";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const {user, accessToken, refresh, loading} = useAuth();
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (!user) return null;

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure? This will delete all your complaints and data permanently.");
    if (confirmed) {
      //api/account/delete
      router.push("/");
      toast.error("Account deleted.");
    }
  };

  return (
    <>
    <Navbar />
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

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
    </>
  );
}