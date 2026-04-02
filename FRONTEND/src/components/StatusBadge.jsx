const statusClasses = {
  Pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  Shortlisted: "border-blue-200 bg-blue-50 text-blue-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
  Hired: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

function StatusBadge({ status }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClasses[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>{status}</span>;
}

export default StatusBadge;
