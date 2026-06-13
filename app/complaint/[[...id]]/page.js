'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { useAuth } from '@/app/context/AuthContext';

function ComplaintForm() {
    const [formData, setFormData] = useState({title:'', description:'', category:'ELECTRICAL', hostel:'Girls Hostel A', room:''});
    const [file, setFile] = useState(null);
    const params = useParams();
    const isEditMode = !!params.id;
    const [loading, setLoading] = useState(isEditMode);

    const [existingImageUrl, setExistingImageUrl] = useState(null);

    const {user, accessToken, refresh} = useAuth();

    const router = useRouter();

    useEffect(() => {
      if(isEditMode) {
        const fetchExistingData = async() => {
          try {
            let res = await fetch(`/api/complaints/${params.id}`, {
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization':`Bearer ${accessToken}`,
              }
            });
            if(res.status === 401) {
              const newToken = await refresh();
              if (newToken) {
                res = await fetch(`/api/complaints/${params.id}`, {
                  headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization':`Bearer ${newToken}`,
                  }
                });
              }
            }
            const data = await res.json();
            if(res.ok) {
              setFormData({title:data.title, description:data.description, category:data.category, hostel:data.hostel, room:data.room});
              setExistingImageUrl(data.imageUrl);
            }
          } catch (error) {
            toast.error("Failed to restore complaint data");
          } finally {
            setLoading(false);
          }
        } 
        fetchExistingData();
      }
    
      
    }, [isEditMode, params.id, accessToken, refresh])
    

    async function handleSubmit(e) {
        e.preventDefault();

        if(!user) {
            toast.alert("please login first");
            router.push('/');
        }

        setLoading(true);
        try {
          let imageUrl = existingImageUrl;

          if (file) {
            const options = {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1280,
              useWebWorker: true,
            };
      
            const compressedFile = await imageCompression(file, options);
            const imageFormData = new FormData();
            imageFormData.append("file", compressedFile);

            const uploadRes = await fetch("/api/image-upload", {
              method: "POST",
              body: imageFormData,
            });
            if (!uploadRes.ok) throw new Error("Image upload failed");
            
            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
          }
          //agar edit kr rhe to patch otherwise post

          const url = isEditMode ? `/api/complaints/${params.id}`: '/api/complaints';
          const method = isEditMode ? 'PATCH' : 'POST'

          let res = await fetch(url, {
              method: method,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization':`Bearer ${accessToken}` 
              },
              body: JSON.stringify({...formData, imageUrl:imageUrl}),
          })
          if (res.status === 401) {
            const newToken = await refresh();
            if (newToken) {
              res = await fetch(url, {
                method: method,
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newToken}` 
                },
                body: JSON.stringify({ ...formData, imageUrl: imageUrl }),
              });
            }
          }
          if(res.ok) {
              toast.success(isEditMode?"complaint edited successfully": "complaint submitted successfully");
              router.push('/my-complaints')
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
              value={formData.title}
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
              value={formData.description}
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
            value={formData.hostel}
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
            value={formData.room}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            onChange={(e) => setFormData({...formData, room: e.target.value})}
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
          {/* Image Preview Section */}
          {(file || existingImageUrl) && (
            <div className="mt-4 relative w-full md:w-64 h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
              <Image 
                src={file ? URL.createObjectURL(file) : existingImageUrl} 
                alt="Complaint Preview" 
                fill 
                className="object-contain"
                onLoadingComplete={() => { if(file) URL.revokeObjectURL(file) }}
              />
              
              {/* Remove/Undo Button */}
              <button 
                type="button"
                onClick={() => {
                  if (file) {
                    setFile(null);
                  } else {
                    setExistingImageUrl(null);
                  }
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                ✕
              </button>
              
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                {file ? "NEW IMAGE SELECTED" : "CURRENT IMAGE"}
              </div>
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

export default ComplaintForm
