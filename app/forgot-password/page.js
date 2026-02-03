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
        if(!email.endsWith("@nitjsr.ac.in")) {
            toast.error("Use your official college email id");
            return;
        }
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            console.log(data);
            if(res.ok) {
                toast.success('OTP sent to your college email!');
                setEmail("");
                router.push(`/verify?id=${data.userId}&type=PASSWORD_RESET`);
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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input type="email" placeholder="Enter your registered email id" value={email} required onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}/>
                </div>
                <button type="submit">{loading?"Please Wait":"Submit"}</button>
            </form>
        </div>
    )
}

export default ForgotPassword