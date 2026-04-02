import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";

function JobCard({ job, compact = false }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">{job.type || "Featured"}</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{job.company}</p>
        </div>
        {job.matchScore ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            {job.matchScore}% Match
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <MapPin className="h-4 w-4 text-slate-500" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
          {job.experienceRequired}
        </span>
      </div>
      {!compact ? <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {(job.skillsRequired || []).slice(0, compact ? 3 : 5).map((skill) => (
          <span key={skill} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{job.salary || "Competitive package"}</span>
        <Link to={`/jobs/${job._id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-blue-200 hover:text-blue-700">
          View Role
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default JobCard;
