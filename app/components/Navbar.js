'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const {user, logout, loading} = useAuth();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);   //it will detect clicking outside

    useEffect(() => {
      const handleClickOutside = (e) => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleLogout () {
        setIsOpen(false);
        await logout();  //logout function call hoga which is in AuthContext
        router.push('/');
        toast.success("Logged out successfully")
    }
    function handleComplaint () {
        if(user) {
            router.push('/complaint');
        } else {
            toast.warning("You need to login before making a complaint");
        }
    }
  return (
    <nav className='flex items-center justify-between px-5 w-full h-16 sticky top-0 bg-white border-b shadow-sm z-50'>
        <div>
            <Link href="/" className='text-3xl font-bold text-blue-500 tracking-tighter'> Hostel<span className='text-gray-800'>Complaints</span></Link>
        </div>

        <div className='flex items-center'>
            
            {/* <Link href= "/complaint"> */}
                <button className='mr-12 bg-blue-500 rounded-lg p-2 text-white' onClick={handleComplaint}>Make a Complaint</button>
            {/* </Link> */}
            {user ? (
                <div className='relative' ref={dropdownRef}>
                {/* avatar */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition border border-blue-200 shadow-sm'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </button>

                {isOpen && (
                        <div className='absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200'>
                            {/* User Info Header */}
                            <div className='px-4 py-3 border-b border-gray-50'>
                                <p className='text-sm font-bold text-gray-800 uppercase tracking-wide'>{user.name}</p>
                                <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                            </div>

                            {/* Links */}
                            <div className='py-1'>
                                <Link 
                                    href="/my-complaints" 
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition'
                                >
                                    My Complaints
                                </Link>
                                <Link 
                                    href="/account" 
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition'
                                >
                                    My Account
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className='border-t border-gray-50 mt-1 pt-1'>
                                <button 
                                    onClick={handleLogout}
                                    className='flex w-full items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='space-x-8'>
                    <Link href="/login" className='text-gray-600 hover:text-blue-500 transition'>
                        Login
                    </Link>
                    <Link href="/signup"
                        className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition'>
                        Signup
                    </Link>
                </div>
            )}
        </div>
    </nav>
  )
}

export default Navbar
