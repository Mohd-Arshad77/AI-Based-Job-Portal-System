import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";

function JobCard({ job, compact = false }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/30 hover:bg-white/12">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">{job.type || "Featured"}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{job.company}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          {job.matchScore || 90}% Match
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/25 px-3 py-1.5">
          <MapPin className="h-4 w-4 text-cyan-200" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/25 px-3 py-1.5">
          <BriefcaseBusiness className="h-4 w-4 text-cyan-200" />
          {job.experienceRequired}
        </span>
      </div>
      {!compact ? <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">{job.description}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {(job.skillsRequired || []).slice(0, compact ? 3 : 5).map((skill) => (
          <span key={skill} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-200">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-300">{job.salary || "Competitive package"}</span>
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/12"
        >
          View Role
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export default JobCard;
