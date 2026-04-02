import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import JobCard from "../../components/JobCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

const dashboardStats = [
  { label: "Profile", value: "Ready", note: "Keep your information updated." },
  { label: "Jobs", value: "Live", note: "See current openings." },
  { label: "Applications", value: "Track", note: "Follow each status change." },
  { label: "Resume", value: "Upload", note: "Improve your matching results." }
];

const quickActions = [
  { title: "Upload Resume", description: "Refresh your profile with your latest resume.", href: "/resume" },
  { title: "Browse Jobs", description: "Explore available roles.", href: "/jobs" },
  { title: "Track Applications", description: "See your current application status.", href: "/applications" }
];

function Dashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    profileApi.getRecommendedJobs().then(({ data }) => setRecommendations(data.slice(0, 3))).catch(() => setRecommendations([]));
  }, []);

  return (
    <Layout title="Dashboard" subtitle="A simple overview of your profile, recommended jobs, and next steps.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((card) => (
          <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Welcome, {user?.name?.split(" ")[0] || "User"}</h2>
          <p className="mt-2 text-sm text-slate-500">Use these shortcuts to continue your job search.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 hover:border-blue-200 hover:bg-blue-50">
                <p className="font-semibold text-slate-950">{action.title}</p>
                <p className="mt-2">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Profile Summary</h2>
          <p className="mt-3 text-sm text-slate-600">Role: <span className="capitalize text-slate-950">{user?.role || "user"}</span></p>
          <p className="mt-2 text-sm text-slate-600">Education: {user?.education || "Add your education"}</p>
          <p className="mt-2 text-sm text-slate-600">Experience: {user?.experience || "Add your experience"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(user?.skills || []).map((skill) => (
              <span key={skill} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">Recommended Jobs</h2>
          <Link to="/jobs" className="text-sm font-medium text-blue-600">View all</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.length ? recommendations.map((job) => (
            <JobCard key={job._id} job={job} compact />
          )) : <p className="text-sm text-slate-500">No recommended jobs available yet.</p>}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
