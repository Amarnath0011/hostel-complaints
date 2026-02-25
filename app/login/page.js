'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const {setUser, setAccessToken} = useAuth();  //ye custom hook

    const router = useRouter();

    const handleLogin = async(e) => {
        e.preventDefault();
        if (!email.endsWith("@nitjsr.ac.in")) {
          toast.error("Please use your official @nitjsr.ac.in email");
          return;
        }
        setLoading(true);
        try {
          const res = await fetch('/api/login', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body:JSON.stringify({email, password})
          });

          const data = await res.json();
          if(res.ok) {
            setUser(data.user);
            setAccessToken(data.accessToken);
            router.push('/')
            toast.success(`Welcome back ${data.user.name}!`);
          } else {
            toast.error(data.error || "Invalid credentials");
          }
        } catch (error) {
          toast.error("Something went wrong");
          console.log(error)
        } finally {
          setLoading(false);
        }
    }

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-96 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            placeholder="2024pgcsca070@nitjsr.ac.in"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            placeholder="Enter Password"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className='mt-3 hover:underline'>
          <Link href="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-600"> Dont have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
    </>
  )
}
export default LoginPage