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

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;

    fetch(`/api/my-complaints?userId=${user.id}`)
      .then((res) => res.json())
      .then((json) => {
        setComplaints(json.data);
        setLoading(false);
      })
      .catch(() => toast.error("Failed to load complaints"));
  }, []);

  if (loading) return <div className="p-10 text-center">Loading your history...</div>;

  function handleEdit() {
    
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
                  <p className="text-sm text-gray-500 mb-2">Category: {c.category} | Hostel: {c.hostel} | Room: {c.roomNumber}</p>
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
                  <button className="text-sm text-red-500 hover:underline">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}