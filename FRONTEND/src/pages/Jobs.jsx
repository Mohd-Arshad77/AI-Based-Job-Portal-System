import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import JobCard from "../components/JobCard.jsx";
import { jobsApi } from "../services/portalService.js";
import { demoJobs } from "../data/demoData.js";

function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState(demoJobs);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [jobType, setJobType] = useState("All");

  useEffect(() => {
    jobsApi.list().then(({ data }) => setJobs(data)).catch(() => setJobs(demoJobs));
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = !query || `${job.title} ${job.company} ${job.skillsRequired?.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = jobType === "All" || job.type === jobType;
    return matchesQuery && matchesLocation && matchesType;
  });

  return (
    <Layout title="Jobs" subtitle="Explore curated opportunities with smart filters, modern cards, and premium interaction details.">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <SectionCard title="Filters" description="Refine the role list with quick, high-signal controls.">
          <div className="space-y-5">
            <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-4">
              <Search className="h-5 w-5 text-cyan-200" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, company, skill"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Filter by location"
              className="w-full rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-400"
            />
            <div className="grid gap-2">
              {["All", "Full-time", "Hybrid", "Remote", "Contract", "On-site"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setJobType(type)}
                  className={`rounded-[1.2rem] px-4 py-3 text-left text-sm font-medium transition ${
                    jobType === type ? "bg-cyan-300 text-slate-950" : "border border-white/12 bg-white/8 text-slate-300 hover:bg-white/12"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Open Roles"
          description={`${filteredJobs.length} results tailored to your filters and current workspace context.`}
          actions={
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-slate-200">
              <SlidersHorizontal className="h-4 w-4" />
              Smart filters enabled
            </span>
          }
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
}

export default Jobs;
