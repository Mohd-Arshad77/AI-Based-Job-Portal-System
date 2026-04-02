import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Building2, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { applicationsApi, jobsApi } from "../../services/api.js";

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    jobsApi.getById(id).then(({ data }) => setJob(data)).catch(() => setJob(null));
  }, [id]);

  const handleApply = async () => {
    try {
      await applicationsApi.apply(id);
      setMessage("Application submitted successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not submit application.");
    }
  };

  if (!job) {
    return <Layout title="Job Details" subtitle="View the selected job."><p className="text-sm text-slate-500">Job not found.</p></Layout>;
  }

  return (
    <Layout title={job.title} subtitle={`${job.company} • ${job.location}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><Building2 className="h-4 w-4 text-slate-500" />{job.company}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><MapPin className="h-4 w-4 text-slate-500" />{job.location}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><BadgeCheck className="h-4 w-4 text-slate-500" />{job.type}</span>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">{job.description}</p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-950">Skills Required</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.skillsRequired || []).map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Salary</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{job.salary || "Competitive"}</p>
          <p className="mt-4 text-sm text-slate-500">Experience</p>
          <p className="mt-2 text-slate-900">{job.experienceRequired}</p>

          {user?.role === "user" ? (
            <button onClick={handleApply} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white hover:bg-blue-700">
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}

          {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
        </div>
      </div>
    </Layout>
  );
}

export default JobDetails;
