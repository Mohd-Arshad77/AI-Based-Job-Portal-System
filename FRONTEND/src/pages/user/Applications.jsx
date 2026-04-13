import { useEffect, useState } from "react";
import { BriefcaseBusiness, Calendar, Clock, MapPin } from "lucide-react";
import Layout from "../../components/Layout.jsx";
import { applicationsApi } from "../../services/api.js";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.list()
      .then(({ data }) => setApplications(data))
      .catch((error) => console.error("Error fetching applications:", error))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
      case "pending":
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 shadow-sm">Pending Review</span>;
      case "interview":
      case "shortlisted":
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 shadow-sm">Shortlisted / Interview</span>;
      case "accepted":
      case "hired":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 shadow-sm">Accepted</span>;
      case "rejected":
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700 shadow-sm">Not Selected</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 shadow-sm">{status || "Applied"}</span>;
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6">

        <div className="mb-12 border-b border-slate-200 pb-8 text-center md:text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Track your journey</h1>
          <p className="mt-3 text-base text-slate-500">Monitor the status of your recent job applications here.</p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-[2.5rem] bg-slate-100"></div>
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <div key={app._id} className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-600/10">

                <div className="relative z-10">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30">
                      <BriefcaseBusiness className="h-7 w-7" />
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{app.job?.title || "Unknown Role"}</h3>
                  <p className="mt-1.5 font-semibold text-blue-600">{app.job?.company || "Company Unavailable"}</p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4 text-base font-medium text-slate-500">
                      <MapPin className="h-5 w-5 text-slate-400" /> <span>{app.job?.location || "Location not given"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-base font-medium text-slate-500">
                      <Clock className="h-5 w-5 text-slate-400" /> <span>{app.job?.type || "Full-time"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-base font-medium text-slate-500">
                      <Calendar className="h-5 w-5 text-slate-400" /> <span>Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 relative z-10">
                   <div className="h-px w-full bg-slate-100 mb-5"></div>
                   <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Everything is in order. Good luck!</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-300 bg-slate-50 py-32 text-center transition-colors hover:border-slate-400 hover:bg-slate-100">
             <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm hover:!scale-110 transition-transform">
                <BriefcaseBusiness className="h-12 w-12" />
             </div>
             <h3 className="mt-8 text-2xl font-bold text-slate-900">No Applications Yet</h3>
             <p className="mt-3 text-base text-slate-500 max-w-md">You haven't submitted any job applications yet. Go explore the jobs page and find your next role!</p>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Applications;
