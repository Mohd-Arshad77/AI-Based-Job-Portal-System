import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, MapPin, Search, Sparkles, Upload } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import JobCard from "../components/JobCard.jsx";
import { jobsApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const stats = [
  { label: "Jobs", value: "Live" },
  { label: "Profiles", value: "Updated" },
  { label: "Hiring", value: "Active" }
];

const steps = [
  {
    title: "Upload Resume",
    description: "Upload your resume and let the parser extract useful information.",
    icon: Upload
  },
  {
    title: "Get Recommendations",
    description: "See roles that match your profile and skills.",
    icon: Sparkles
  },
  {
    title: "Apply Jobs",
    description: "Apply and track status updates in one place.",
    icon: BriefcaseBusiness
  }
];

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/recruiter/manage");
    }
  }, [user, navigate]);

  useEffect(() => {
    jobsApi.list().then(({ data }) => setFeaturedJobs(data.slice(0, 4))).catch(() => setFeaturedJobs([]));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("query", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Smart hiring and job discovery
            </div>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Find Your Dream Job with AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Search jobs, upload your resume, and track your applications in one clean workflow.
            </p>

            <form onSubmit={handleSearch} className="mt-8 grid gap-3 rounded-[32px] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1.2fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title, skill, or company" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </label>
              <label className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                <MapPin className="h-5 w-5 text-slate-400" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location or remote" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Search Jobs
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/resume" className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-blue-200 hover:text-blue-700">
                  Upload Resume
                  <Upload className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </div>

          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-blue-700">Featured Jobs</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Latest jobs from the platform</h2>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              Explore all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {featuredJobs.length ? featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} compact />
            )) : <p className="text-sm text-slate-500">No jobs available right now.</p>}
          </div>
        </section>

        <section className="mt-20 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-blue-700">How It Works</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">A simple path from resume to application</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Step {index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
