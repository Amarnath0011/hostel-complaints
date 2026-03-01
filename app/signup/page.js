"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const {user} = useAuth();
    
    const router = useRouter();
    useEffect(() => {
      if (user) {
        toast.message('You are already signed in')
        router.replace('/'); // Use replace so they can't go back to signup
      }
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        
        let newErrors = {};

        const normalizedEmail = email.trim().toLowerCase();

        if(!normalizedEmail.endsWith("@nitjsr.ac.in")) {
          newErrors.email = "Use your official college email id";
        }

        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
          newErrors.password = "Must be 8+ chars with a special character.";
        }

        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match.";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
        }
        try {
          const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email: normalizedEmail, password }),
          });
          const data = await res.json();
          if(res.ok) {
            toast.success('OTP sent to your college email!');
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            router.push(`/verify?token=${data.token}&type=SIGNUP`);
          } else {
            toast.error(data.error || "Signup failed");
          }
        } catch(error) {
          toast.error(error.message)
        } finally {
          setLoading(false);
        }
    }

  return (
    <div className='flex flex-col h-screen'>
    <Navbar />
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create an Account</h2>
            
            <input 
                type='text' 
                placeholder='Full Name' 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
                required
            />
            <div>
              <input 
                  type='email' 
                  placeholder='2024pgcsca070@nitjsr.ac.in' 
                  value={email} 
                  onChange={(e) => {setEmail(e.target.value.trim());
                    if(errors.email) {
                      setErrors((prev) => {
                        const {email, ...rest} = prev;
                        return rest;
                      })
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:border-transparent focus:ring-2 transition text-black ${errors.email ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300'} `}
                  required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <input 
                  type='password' 
                  placeholder='Password' 
                  value={password} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    setPassword(value);
                    if(errors.password) {
                      setErrors((prev) => {
                        const {password, ...rest} = prev;
                        return rest;
                      })
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-black ${errors.password ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300'}`}
                  required
              />
              {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
            </div>
            
            <div>
              <input 
                  type='password' 
                  placeholder='Confirm Password' 
                  value={confirmPassword} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    setConfirmPassword(value);
                    if(errors.confirmPassword) {
                      setErrors((prev) => {
                        const {confirmPassword, ...rest} = prev;
                        return rest;
                      })
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-black ${errors.confirmPassword ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300'}`}
                  required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1"> {errors.confirmPassword} </p> }
            </div>
            
            <button 
                type='submit' 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-400 mt-2"
            >
                {loading ? "Please wait..." : "Sign Up"}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                    Login
                </Link>
            </p>
        </form>
    </div>
    </div>
  )
}

export default Signup