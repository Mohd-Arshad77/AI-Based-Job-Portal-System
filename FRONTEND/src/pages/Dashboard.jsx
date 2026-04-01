import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, Sparkles, UploadCloud } from "lucide-react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import JobCard from "../components/JobCard.jsx";
import { jobsApi, profileApi } from "../services/portalService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardStats, demoJobs, quickActions } from "../data/demoData.js";

function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(demoJobs);
  const [recommendations, setRecommendations] = useState(demoJobs.slice(0, 3));

  useEffect(() => {
    jobsApi.list().then(({ data }) => setJobs(data.slice(0, 4))).catch(() => setJobs(demoJobs.slice(0, 4)));
    profileApi.getRecommendedJobs().then(({ data }) => setRecommendations(data.slice(0, 3))).catch(() => setRecommendations(demoJobs.slice(0, 3)));
  }, []);

  return (
    <Layout title="Dashboard" subtitle="Track opportunities, manage AI-curated matches, and keep your hiring workflow beautifully organized.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((card) => (
          <SectionCard key={card.label} title={card.value} description={card.label}>
            <p className="text-sm text-slate-400">{card.note}</p>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`} description="Your workspace is tuned for premium opportunities and fast next steps.">
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className={`rounded-[1.8rem] border border-white/12 p-5 transition hover:-translate-y-1 hover:border-cyan-300/25 ${
                  index === 0 ? "bg-gradient-to-br from-cyan-300/16 via-indigo-400/14 to-violet-500/16" : "bg-slate-950/24"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white">
                  {index === 0 ? <UploadCloud className="h-5 w-5" /> : index === 1 ? <BriefcaseBusiness className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{action.description}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Profile Snapshot" description="The signal layer JobAI uses for ranking and shortlisting.">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/24 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-2 text-lg font-semibold text-white capitalize">{user?.role || "user"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/24 p-4">
              <p className="text-sm text-slate-400">Experience</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{user?.experience || "Add your experience to improve recommendation accuracy."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(user?.skills || ["React", "Tailwind CSS", "Communication"]).map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Suggested Jobs"
          description="AI-ranked roles based on your skills, experience, and hiring momentum."
          actions={
            <Link to="/jobs" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {recommendations.map((job) => (
              <JobCard key={job._id} job={job} compact />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Hiring Momentum" description="A quick pulse on activity tied to your current profile.">
          <div className="space-y-4">
            {[
              { label: "Open roles in your lane", value: jobs.filter((job) => job.isActive).length },
              { label: "Average match score", value: `${Math.round(recommendations.reduce((sum, job) => sum + (job.matchScore || 0), 0) / (recommendations.length || 1))}%` },
              { label: "Skills detected", value: user?.skills?.length || 5 }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-slate-950/24 px-4 py-4">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-lg font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
}

export default Dashboard;
