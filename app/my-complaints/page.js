"use client";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { toast } from "sonner";
import Navbar from "../components/Navbar";

const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 border-2 rounded-full px-2 py-1",
    RESOLVED: "bg-green-100 text-green-700 border-green-200 border-2 rounded-full px-2 py-1",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200 border-2 rounded-full px-2 py-1",
    REJECTED: "bg-red-100 text-red-700 border-red-200 border-2 rounded-full px-2 py-1"
  };

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    async function fetchComplaints() {
      const user = getStoredUser();
      if (!user) return;
      try {
        const res = await fetch(`/api/my-complaints?userId=${user.id}`);
        const json = await res.json();
        
        if (res.ok) {
          setComplaints(json.data);
        } else {
          toast.error(json.error || "Failed to load complaints");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading your history...</div>;

  async function handleEdit() {
  }
  
  async function handleDelete(complaintId) {
    const user = getStoredUser();
    if (!user?.id) {
      toast.error("You must be logged in to do that.");
      return;
    }

    toast.loading("Deleting complaint...", { id: "delete-toast" });

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "DELETE",
        headers: { "userId": user.id }
      });

      const data = await res.json();

      if (res.ok) {
        setComplaints((prev) => prev.filter(c => c.id !== complaintId));
        toast.success("Complaint removed successfully", { id: "delete-toast" });
        setShowConfirm(null);
      } else {
        toast.error(data.error || "Failed to delete", { id: "delete-toast" });
      }
    } catch (error) {
      toast.error("Network error occurred", { id: "delete-toast" });
    }
  }

  return (
    <>
    <Navbar/>
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Complaints</h1>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500">No complaints found. Everything looks good!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((c) => (
            <div key={c.id} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Category: {c.category} | Hostel: {c.hostel} | Room: {c.room}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[c.status]}`}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{c.description}</p>
              <div className="mt-4 flex justify-end gap-3">
                <button className="text-sm text-blue-600 hover:underline">View Details</button>
                {c.status === "PENDING" && (
                  <button className="text-sm hover:underline" onClick={handleEdit}>Edit</button>
                )}
                {c.status === "PENDING" && (
                  <button className="text-sm text-red-500 hover:underline" onClick={() => setShowConfirm(c.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl scale-in-95 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              This action cannot be undone. This complaint will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(showConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}