'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

function ComplaintPopUp({complaint, onClose, onStatusUpdate}) {
  const [status, setStatus] = useState(complaint.status);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const {user, accessToken, refresh} = useAuth();
  const isSupervisor = user?.role === "SUPERVISOR";
  if (!complaint) return null;

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 border-2 rounded-md px-2 py-1",
    RESOLVED: "bg-green-100 text-green-700 border-green-200 border-2 rounded-md px-2 py-1",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200 border-2 rounded-md px-2 py-1",
    REJECTED: "bg-red-100 text-red-700 border-red-200 border-2 rounded-md px-2 py-1"
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchComments() {
      if (!accessToken) return;
      setCommentsLoading(true);
      try {
        let res = await fetch(`/api/complaints/${complaint.id}/comments`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.status === 401) {
          const newToken = await refresh();
          if (newToken) {
            res = await fetch(`/api/complaints/${complaint.id}/comments`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
          }
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load comments");
        if (!cancelled) setComments(data.data || []);
      } catch (error) {
        if (!cancelled) toast.error(error.message);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    fetchComments();
    return () => { cancelled = true; };
  }, [complaint.id, accessToken, refresh]);

  async function handleStatusChange(newStatus) {
    if(newStatus === complaint.status) return;
    try {
      let res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${accessToken}` },
        body: JSON.stringify({status: newStatus})
      });
      if (res.status === 401) {
        const newToken = await refresh();
        if (newToken) {
          res = await fetch(`/api/complaints/${complaint.id}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
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

  async function handleAddComment(e) {
    e.preventDefault();
    const content = commentText.trim();
    if (!content || !accessToken) return;
    setCommentSubmitting(true);
    try {
      let res = await fetch(`/api/complaints/${complaint.id}/comments`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ content })
      });
      if (res.status === 401) {
        const newToken = await refresh();
        if (newToken) {
          res = await fetch(`/api/complaints/${complaint.id}/comments`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
            body: JSON.stringify({ content })
          });
        }
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      setComments((prev) => [...prev, data]);
      setCommentText('');
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCommentSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-8">
          <div className="mb-6 flex justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{complaint.category}</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">{complaint.title}</h2>
              <p className="text-sm text-gray-400 mt-2">
                Reported by <span className="font-medium text-gray-700">{complaint.user?.name || "Student"}</span> • {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isSupervisor && (
              <div className='mt-10 px-5'>
                <select value={status} onChange={(e) => handleStatusChange(e.target.value)} className={`border-0 cursor-pointer transition-all ${statusStyles[status]}`}>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            )}
          </div>
          <div className="text-gray-700 mb-4"><p>{complaint.description}</p></div>
          {complaint.imageUrl && (
            <div className="relative w-full md:w-64 h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4">
              <Image src={complaint.imageUrl} alt={complaint.title} fill className="object-contain" />
            </div>
          )}
          <hr className="border-gray-100 mb-4" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800">Comments</h3>
              <span className="text-sm text-gray-500">{comments.length}</span>
            </div>
            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
              {commentsLoading ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">No comments yet. Start the discussion.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="font-semibold text-gray-800">
                        {comment.user?.name || "User"}
                        <span className="ml-2 text-[10px] font-bold uppercase text-blue-600">{comment.user?.role || ""}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={1000} rows={2} placeholder="Write a comment or reply..." className="flex-1 resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" disabled={commentSubmitting} />
              <button type="submit" disabled={commentSubmitting || !commentText.trim()} className="self-end rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-300">
                {commentSubmitting ? "Sending..." : "Send"}
              </button>
            </form>
            <p className="mt-1 text-right text-[11px] text-gray-400">{commentText.length}/1000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintPopUp
