"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
const Verify = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  async function handleVerify (e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers:{},
        body: JSON.stringify({enteredOTP: otp, token:token, type:type})
      })
      const data = await res.json();
      if(res.ok) {
        if(type === "SIGNUP") {
          toast.success("Account verified! You can now login");
          router.push('/login')
        }
        if(type === "PASSWORD_RESET") {
          toast.success("Email verified!");
          router.push(`/reset-password?token=${data.token}`);
        }
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleResend = async () => {
    setTimer(60);
    
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to resend");
      } 
      toast.promise({
        loading: 'Sending new OTP...',
        success: 'New OTP sent to your mail!',
        error: (err) => err.message,
      });
    } catch (error) {
      toast.error("Something went wrong");
    }};

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Verify Email</h2>
        <p className="text-sm text-center text-gray-600">
          Enter the 6-digit code sent to your NITJSR email.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-2xl tracking-[1rem] font-bold p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="000000"
            required
          />
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">Resend OTP in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Verify