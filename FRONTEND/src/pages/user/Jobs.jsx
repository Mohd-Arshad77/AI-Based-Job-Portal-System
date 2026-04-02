import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import JobCard from "../../components/JobCard.jsx";
import { jobsApi } from "../../services/api.js";

function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    jobsApi.list().then(({ data }) => setJobs(data)).catch(() => setJobs([]));
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = !query || `${job.title} ${job.company} ${job.skillsRequired?.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    return matchesQuery && matchesLocation;
  });

  return (
    <Layout title="Jobs" subtitle="Browse available jobs and filter them by keyword or location.">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, company, skill" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </label>
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Filter by location" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredJobs.length ? filteredJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        )) : <p className="text-sm text-slate-500">No jobs found.</p>}
      </div>
    </Layout>
  );
}

export default Jobs;
