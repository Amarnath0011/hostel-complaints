'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState("");
    const router = useRouter();
    async function handleSubmit(e) {
        e.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();
        if(!normalizedEmail.endsWith("@nitjsr.ac.in")) {
            toast.error("Use your official college email id");
            return;
        }
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email:normalizedEmail }),
            });
            const data = await res.json();
            // console.log(data);
            if(res.ok) {
                toast.success('OTP sent to your college email!');
                setEmail("");
                router.push(`/verify?token=${data.resetToken}&type=PASSWORD_RESET`);
            } else {
                toast.error(data.error || "");
            }
        } catch(error) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex justify-center items-center p-4">
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6"
            >
                <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                    Email Address
                </label>
                <input 
                    type="email" 
                    placeholder="Enter your registered email id" 
                    value={email} 
                    required 
                    onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                </div>

                <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:shadow-none"
                >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                    Please Wait...
                    </span>
                ) : (
                    "Submit"
                )}
                </button>
            </form>
        </div>
    )
}

export default ForgotPassword