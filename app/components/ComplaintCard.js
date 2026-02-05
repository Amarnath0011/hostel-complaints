'use client';

const ComplaintCard = ({complaint, onClick}) => {

  const {title, hostel, room, category, status, user, createdAt} = complaint;


  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 border-2 rounded-full px-2 py-1",
    RESOLVED: "bg-green-100 text-green-700 border-green-200 border-2 rounded-full px-2 py-1",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200 border-2 rounded-full px-2 py-1",
    REJECTED: "bg-red-100 text-red-700 border-red-200 border-2 rounded-full px-2 py-1"
  };

  const categoryStyles = {
    ELECTRICAL: "text-indigo-700",
    PLUMBING: "text-cyan-700",
    CIVIL: "text-gray-700",
    MESS: "text-orange-700",
    OTHER: "text-slate-700",
  };
  
  return (
    <div onClick={onClick} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm cursor-pointer">
        <div className="flex items-start justify-between gap-3">
            {/* title */}
            <h1 className="text-lg font-semibold text-gray-900 leading-snug">{title}</h1>
            <div className="flex items-center gap-10 shrink-0">
                {/* Category */}
                <span
                    className={`flex items-center gap-1 text-sm font-medium ${categoryStyles[category]}`}
                >
                <span className="h-2 w-2 rounded-full bg-current" />
                    {category}
                </span>

                {/* Status */}
                <span className={`${statusStyles[status]}`}>
                    {status.replace('_', " ")}
                </span>
            </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
            {hostel} · Room {room}
        </div>
        <div className="mt-1 flex items-center gap-3 border-t border-gray-100 pt-1 text-xs text-gray-400">
            <span>By <span className="font-medium text-gray-500">{user.name}</span></span>
            <span>•</span>
            <span>{new Date(createdAt).toLocaleDateString("en-GB")}</span>
        </div>
    </div>
  );
};

export default ComplaintCard;