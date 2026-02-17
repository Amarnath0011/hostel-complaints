'use client'
import React, { useState } from 'react'
import ComplaintCard from './ComplaintCard'
import FilterBar from './FilterBar'
import ComplaintPopUp from './ComplaintPopUp'

function ComplaintFeed({initialComplaints = []}) {
    const [complaints, setComplaints] = useState(initialComplaints);

    const [filters, setFilters] = useState({
        status: "ALL",
        category: "ALL",
        hostel: "ALL",
        sort: "Newest",
    });
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    
    function handleStatusUpdate (id, newStatus) {
      setComplaints((prev) => 
        prev.map((c) => (c.id === id 
        ? {...c, status:newStatus}
        :c)))
    }

    // Filtering logic
    const filtered = complaints.filter((c) => {
      const matchStatus = filters.status === "ALL" || c.status === filters.status;
      const matchCategory = filters.category === "ALL" || c.category === filters.category;
      const matchHostel = filters.hostel === "ALL" || (c.hostel && c.hostel === filters.hostel); 
      return matchStatus && matchCategory && matchHostel;
    }).sort((a, b) => {
      return filters.sort === "Newest" 
        ? new Date(b.createdAt) - new Date(a.createdAt) 
        : new Date(a.createdAt) - new Date(b.createdAt);
    });

  
    return (
      <>
        <FilterBar filters={filters} setFilters={setFilters} />
    
        {/* <div className="flex flex-col gap-4 mt-6 m-10"> */}
        <div className= " grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-10">
          {filtered.map((complaint) => (
            <ComplaintCard 
              key={complaint.id} 
              complaint={complaint} 
              onClick={() => setSelectedComplaint(complaint)} 
            />
          ))}
        </div>
        {selectedComplaint && (
          <ComplaintPopUp 
          complaint= {selectedComplaint} 
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdate= {handleStatusUpdate}
          />
        )}
      </>
    );
}

export default ComplaintFeed
