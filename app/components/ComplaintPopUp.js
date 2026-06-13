'use client'
import Image from 'next/image';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

function ComplaintPopUp({complaint, onClose, onStatusUpdate}) {
  const [status, setStatus] = useState(complaint.status);
  const {user, accessToken, refresh} = useAuth();
  const isSupervisor = user?.role === "SUPERVISOR";
  if (!complaint) return null;

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 border-2 rounded-md px-2 py-1",
    RESOLVED: "bg-green-100 text-green-700 border-green-200 border-2 rounded-md px-2 py-1",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200 border-2 rounded-md px-2 py-1",
    REJECTED: "bg-red-100 text-red-700 border-red-200 border-2 rounded-md px-2 py-1"
  };

  async function handleStatusChange(newStatus) {
    if(newStatus === complaint.status) return;
    try {
      let res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization':`Bearer ${accessToken}` 
        },
        body: JSON.stringify({status: newStatus})
      });

      if (res.status === 401) {
        const newToken = await refresh();
        if (newToken) {
          res = await fetch(`/api/complaints/${complaint.id}`, {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({ status: newStatus })
          });
        }
      }

      if(res.ok) {
        setStatus(newStatus);
        onStatusUpdate(complaint.id, newStatus);
        toast.success("Status updated")
      } else {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto  rounded-2xl shadow-2xl relative">
        
        {/* close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* title */}
          <div className="mb-6 flex justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {complaint.category}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">{complaint.title}</h2>
              <p className="text-sm text-gray-400 mt-2">
                Reported by <span className="font-medium text-gray-700">{complaint.user?.name || "Student"}</span> • {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isSupervisor && (
              <div className='mt-10 px-5'>
                  <select 
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`border-0 cursor-pointer transition-all ${statusStyles[status]}`}
                  >
                    <option value="PENDING" className={`${statusStyles["PENDING"]}`}>PENDING</option>
                    <option value="IN_PROGRESS" className={`${statusStyles["IN_PROGRESS"]}`}>IN PROGRESS</option>
                    <option value="RESOLVED" className={`${statusStyles["RESOLVED"]}`}>RESOLVED</option>
                    <option value="REJECTED" className={`${statusStyles["REJECTED"]}`}>REJECTED</option>
                  </select>
              </div>
            )}
            
          </div>

          {/* description */}
          <div className="text-gray-700 mb-4">
            <p>{complaint.description}</p>
          </div>

          {/* images */}
          {complaint.imageUrl && (
            <div className="relative w-full md:w-64 h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4">
              <Image 
                src={complaint.imageUrl} 
                alt={complaint.title}
                fill
                className="object-contain"
              />
            </div>
          )}

          <hr className="border-gray-100 mb-4" />

          {/* comment section */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Comments</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500 italic">
              Comment section will be implemented here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintPopUp
