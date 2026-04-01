const statusClasses = {
  Pending: "border-amber-300/25 bg-amber-300/12 text-amber-100",
  Shortlisted: "border-violet-300/25 bg-violet-300/12 text-violet-100",
  Rejected: "border-rose-300/25 bg-rose-300/12 text-rose-100",
  Hired: "border-emerald-300/25 bg-emerald-300/12 text-emerald-100"
};

function StatusBadge({ status }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status] || "border-white/15 bg-white/10 text-white"}`}>{status}</span>;
}

export default StatusBadge;
