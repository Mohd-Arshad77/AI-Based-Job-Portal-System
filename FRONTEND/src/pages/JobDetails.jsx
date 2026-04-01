import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Building2, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { applicationsApi, jobsApi } from "../services/portalService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { demoJobs } from "../data/demoData.js";

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(demoJobs.find((item) => item._id === id) || demoJobs[0]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    jobsApi.getById(id).then(({ data }) => setJob(data)).catch(() => setJob(demoJobs.find((item) => item._id === id) || demoJobs[0]));
  }, [id]);

  const handleApply = async () => {
    try {
      await applicationsApi.apply(id);
      setMessage("Application submitted successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Application saved in the demo UI. Connect the backend to persist it.");
    }
  };

  if (!job) return null;

  return (
    <Layout title={job.title} subtitle={`${job.company} • ${job.location}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="Job Overview" description={`Experience required: ${job.experienceRequired}`}>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/24 px-3 py-1.5">
              <Building2 className="h-4 w-4 text-cyan-200" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/24 px-3 py-1.5">
              <MapPin className="h-4 w-4 text-cyan-200" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/24 px-3 py-1.5">
              <BadgeCheck className="h-4 w-4 text-cyan-200" />
              {job.type}
            </span>
          </div>

          <p className="mt-6 text-sm leading-8 text-slate-300">{job.description}</p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.skillsRequired || []).map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-medium text-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <SectionCard title="Apply" description="Fast, focused, and recruiter-ready.">
            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/24 p-4">
                <p className="text-sm text-slate-400">Compensation</p>
                <p className="mt-2 text-xl font-semibold text-white">{job.salary}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/24 p-4">
                <p className="text-sm text-slate-400">Applicants</p>
                <p className="mt-2 text-xl font-semibold text-white">{job.applicantsCount}</p>
              </div>
              {user?.role === "user" ? (
                <button
                  onClick={handleApply}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </Layout>
  );
}

export default JobDetails;
