import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Upload, Search, Map } from "lucide-react";
import Layout from "../../components/Layout.jsx";
import JobCard from "../../components/JobCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

const quickActions = [
  { 
    title: "Upload Resume", 
    description: "Refresh your profile with your latest resume.", 
    href: "/resume",
    icon: Upload
  },
  { 
    title: "Browse Jobs", 
    description: "Explore available roles.", 
    href: "/jobs",
    icon: Search
  },
  { 
    title: "Track Applications", 
    description: "See your current application status.", 
    href: "/applications",
    icon: Map
  }
];

function Dashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    profileApi.getRecommendedJobs()
      .then(({ data }) => setRecommendations(data.slice(0, 3)))
      .catch(() => setRecommendations([]));
  }, []);

  return (
    <Layout 
      title="Dashboard" 
      subtitle="A simple overview of your profile, recommended jobs, and next steps."
    >
      {/* JOB-RELATED HERO BANNER REPLACING STATS CARDS */}
      <div className="relative mb-12 h-64 w-full overflow-hidden rounded-[24px] shadow-sm lg:h-72">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          alt="Team collaborating in a modern office"
          className="h-full w-full object-cover"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-900/60 to-transparent"></div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-10">
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Workspace
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-indigo-100 sm:text-base">
            Continue your journey to find the perfect role matching your cognitive profile and technical expertise.
          </p>
        </div>
      </div>

      {/* 3-PART QUICK ACTIONS */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Next Steps</h2>
        <p className="mt-2 text-slate-500">Use these shortcuts to continue your job search journey.</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Link 
              key={action.title} 
              to={action.href} 
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-indigo-600 transition-colors group-hover:bg-indigo-50">
                <ActionIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-indigo-950 transition-colors group-hover:text-indigo-700">
                {action.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* BOTTOM SECTION: PROFILE & RECOMMENDED JOBS */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Profile Summary */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-indigo-950">My Profile Summary</h2>
          
          <div className="mt-6 space-y-5">
          
            
            <div className="grid grid-cols-2 gap-4">
             
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Experience</p>
                <p className="mt-1 text-sm text-slate-700">{user?.experience || "Add your experience"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">My  Skills</p>
            <div className="flex flex-wrap gap-2">
              {(user?.skills || []).length > 0 ? (
                user.skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No skills added yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-indigo-950">Recommended Jobs</h2>
              <p className="mt-1 text-sm text-slate-500">Based on your cognitive profile</p>
            </div>
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-800"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 flex-1">
            {recommendations.length ? (
              recommendations.map((job) => (
                <JobCard key={job._id} job={job} compact />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <BriefcaseBusiness className="mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-900">No matches yet</p>
                <p className="mt-1 text-xs text-slate-500 max-w-[200px]">
                  Keep your profile updated to get AI-powered matches.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;