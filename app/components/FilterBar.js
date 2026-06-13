"use client";

import { useState } from "react";

export default function FilterBar({filters, setFilters}) {
  const statuses = [
    { value: "ALL", label: "ALL" },
    { value: "PENDING", label: "PENDING" },
    { value: "IN_PROGRESS", label: "IN PROGRESS" },
    { value: "RESOLVED", label: "RESOLVED" },
    { value: "REJECTED", label: "REJECTED" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-md sticky top-16 z-30">
      
      {/* status */}
      <div className="flex gap-1 rounded-md bg-gray-100 p-1">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilters({ ...filters, status: status.value })}
            className={`px-3 py-1 text-sm rounded-md transition
              ${filters.status === status.value
                ? "bg-blue-700 shadow text-white"
                : "text-gray-500 hover:text-gray-700"} ease-in`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* categories */}
      <select
        value={filters.category}
        onChange={(e) =>
          setFilters({ ...filters, category: e.target.value })
        }
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm"
      >
        <option value="ALL">All Categories</option>
        <option value="ELECTRICAL">Electrical</option>
        <option value="PLUMBING">Plumbing</option>
        <option value="CIVIL">Civil</option>
        <option value="MESS">Mess</option>
        <option value="OTHER">Other</option>
      </select>

      {/* hostel */}
      <select
        value={filters.hostel}
        onChange={(e) =>
          setFilters({ ...filters, hostel: e.target.value })
        }
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm"
      >
        <option value="ALL">All Hostels</option>
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

      {/* sort button */}
      <button
        onClick={() =>
          setFilters({
            ...filters,
            sort: filters.sort === "Newest" ? "Oldest" : "Newest",
          })
        }
        className=" flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        {filters.sort === "Newest" ? "Newest ↓" : "Oldest ↑"}
      </button>

      {/* clear filters button */}
      <button onClick={() => setFilters({status: "ALL", category: "ALL", hostel: "ALL", sort: "Newest"})}
        className="text-sm font-bold text-red-50 border-2 border-red-500 rounded-full px-2 py-1 bg-red-500"
      >
        Clear All
      </button>
    </div>
  );
}
