import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  Sparkles,
  Upload
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import JobCard from "../components/JobCard.jsx";
import { featuredJobs } from "../data/demoData.js";

const stats = [
  { label: "Jobs", value: "1000+" },
  { label: "Companies", value: "500+" },
  { label: "Users", value: "10k+" }
];

const steps = [
  {
    title: "Upload Resume",
    description: "Drop your latest profile and let JobAI extract your strengths, projects, and role fit instantly.",
    icon: Upload
  },
  {
    title: "Get Recommendations",
    description: "Our ranking engine matches you to high-fit openings using skill overlap and hiring signals.",
    icon: Sparkles
  },
  {
    title: "Apply Jobs",
    description: "Move from shortlist to hiring decisions with one streamlined experience and clear status tracking.",
    icon: BriefcaseBusiness
  }
];

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("query", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-violet-500/24 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-[28rem] w-[28rem] rounded-full bg-cyan-400/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-indigo-500/18 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Premium AI career discovery for modern talent teams
              </div>
              <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Find Your Dream Job with AI
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Discover premium roles, intelligent recommendations, and a hiring flow designed like a modern SaaS product from the first search to the final offer.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 grid gap-3 rounded-[2rem] border border-white/12 bg-white/10 p-3 shadow-[0_24px_90px_rgba(15,23,42,0.2)] backdrop-blur-2xl md:grid-cols-[1.2fr_1fr_auto]"
              >
                <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/25 px-4 py-4">
                  <Search className="h-5 w-5 text-cyan-200" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Job title, skill, or company"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/25 px-4 py-4">
                  <MapPin className="h-5 w-5 text-cyan-200" />
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Location or remote"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-[1.4rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    Search Jobs
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    to="/resume-upload"
                    className="inline-flex items-center justify-center gap-2 rounded-[1.4rem] border border-white/12 bg-white/8 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    Upload Resume
                    <Upload className="h-4 w-4" />
                  </Link>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                {["Product Designer", "Frontend Engineer", "AI Researcher", "Remote-first"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-300/20 via-indigo-500/15 to-violet-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-white/10 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] backdrop-blur-2xl">
                <div className="grid gap-4">
                  <div className="rounded-[1.8rem] border border-white/12 bg-slate-950/28 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300">AI Match Score</p>
                        <p className="mt-2 text-4xl font-semibold text-white">94%</p>
                      </div>
                      <div className="rounded-2xl bg-cyan-300/16 p-3 text-cyan-100">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5">
                      <p className="text-sm text-slate-300">Recommended Roles</p>
                      <div className="mt-4 space-y-3">
                        {["Senior Product Designer", "Frontend Engineer", "Growth Designer"].map((role) => (
                          <div key={role} className="rounded-2xl border border-white/10 bg-slate-950/28 px-4 py-3 text-sm text-white">
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5">
                      <p className="text-sm text-slate-300">Resume Signals</p>
                      <div className="mt-4 grid gap-3">
                        {[
                          { label: "Design Systems", value: "Strong" },
                          { label: "React", value: "Advanced" },
                          { label: "Communication", value: "Verified" }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/28 px-4 py-3">
                            <span className="text-sm text-slate-300">{item.label}</span>
                            <span className="text-sm font-semibold text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/12 bg-gradient-to-r from-cyan-300/14 via-indigo-400/12 to-violet-500/16 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-300">Trusted by high-growth teams</p>
                        <p className="mt-2 text-lg font-semibold text-white">Nebula Labs, Orbit People, Prism AI</p>
                      </div>
                      <div className="flex -space-x-3">
                        {["NL", "OP", "PA"].map((abbr) => (
                          <div key={abbr} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/35 text-sm font-semibold text-white">
                            {abbr}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2.5rem] border border-white/12 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[1.8rem] border border-white/10 bg-slate-950/25 p-6">
                <p className="text-4xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200/80">Featured Jobs</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Curated roles from ambitious teams</h2>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
              Explore all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} compact />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] border border-white/12 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200/80">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">A smoother path from resume to offer</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Built for clarity, speed, and confidence. Every surface is optimized to help candidates discover the right role and help teams hire faster.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="rounded-[2rem] border border-white/12 bg-slate-950/25 p-6 transition hover:-translate-y-1 hover:bg-slate-950/32">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-indigo-400 to-violet-500 text-slate-950">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Step {index + 1}</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-semibold text-white">JobAI</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">A premium AI-based job portal system for modern candidates, recruiters, and hiring teams.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-300">
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Get Started</Link>
          </div>
          <p className="text-sm text-slate-500">Copyright {new Date().getFullYear()} JobAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
