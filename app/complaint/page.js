'use client'
import { getStoredUser } from '@/lib/auth';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Image from 'next/image';

function NewComplaint() {
    const [formData, setFormData] = useState({title:'', description:'', category:'ELECTRICAL', hostel:'', roomNo:''});
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        const user = getStoredUser();
        if(!user) {
            toast.alert("please login first");
            return;
        }
        const userId = user.id;
        setLoading(true);
        try {
          let imageUrl = null;

          if (file) {
            const imageFormData = new FormData();
            imageFormData.append("file", file);

            const uploadRes = await fetch("/api/image-upload", {
              method: "POST",
              body: imageFormData,
            });
            if (!uploadRes.ok) throw new Error("Image upload failed");
            
            const uploadData = await uploadRes.json();
            // console.log(uploadData.url);
            imageUrl = uploadData.url;
          }

          const res = await fetch('/api/complaints', {
              method: 'POST',
              headers: { "userId": userId, 'Content-Type': 'application/json' },
              body: JSON.stringify({...formData, imageUrl:imageUrl}),
          })
          if(res.ok) {
              toast.success("complaint submitted successfully");
              router.push('/')
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || "Submission failed");
          }
        } catch (error) {
          toast.error(error);
        } finally {
          setLoading(false);
        }
    }
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Report an Issue</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What is the issue?</label>
            <input 
              type="text"
              maxLength={75}
              placeholder="e.g. Water leakage in Room 302"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-black"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option>ELECTRICAL</option>
              <option>PLUMBING</option>
              <option>CIVIL</option>
              <option>MESS</option>
              <option>OTHER</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea 
                maxLength={500}
              placeholder="Provide more details about the problem..."
              className="w-full p-3 border border-gray-300 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <p className='text-gray-500'> {formData.description.length} / 500 characters</p>
          </div>

          {/* Hostel & room no*/}

        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" >Hostel</label>
            <select 
            className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-black"
            onChange={(e) => setFormData({...formData, hostel: e.target.value})}
            >
            <option>Girls Hostel A</option>
            <option>Girls Hostel B</option>
            <option>Girls Hostel C</option>
            <option>Girls Hostel D</option>
            <option>Girls Hostel RLB</option>
            <option>Boys Hostel E</option>
            <option>Boys Hostel F</option>
            <option>Boys Hostel G</option>
            <option>Boys Hostel H</option>
            <option>Boys Hostel I</option>
            <option>Boys Hostel J</option>
            <option>Boys Hostel K</option>
            <option>Boys Hostel L</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room No</label>
            <input 
            type="text"
            placeholder="e.g. E-511"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
            required
            />
        </div>


          {/* todo later add block too */}


          {/* Drag & Drop Box */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Photos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*"
              />
              <div className="text-4xl mb-2 text-gray-400">📸</div>
              <p className="text-sm text-gray-600">
                {file ? <strong>Selected: {file.name}</strong> : "Click to browse or drag and drop"}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
            </div>
          </div>
          {file && (
            <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden ">
              <Image 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-lg border"
                fill
                onLoad={() => URL.revokeObjectURL(file)}
              />
              <button 
                type='button'
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 shadow-lg"
              >
                ✕
              </button>
            </div>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}

export default NewComplaint
