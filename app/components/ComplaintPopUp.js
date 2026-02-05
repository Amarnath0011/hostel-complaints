'use client'
import Image from 'next/image';
import React from 'react'

function ComplaintPopUp({complaint, onClose}) {
  if (!complaint) return null;

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
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {complaint.category}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3">{complaint.title}</h2>
            <p className="text-sm text-gray-400 mt-2">
              Reported by <span className="font-medium text-gray-700">{complaint.user?.name || "Student"}</span> • {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
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
