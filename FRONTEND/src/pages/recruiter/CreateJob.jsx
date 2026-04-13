import { Calendar, CheckCircle2, FileText, Plus, Users } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { jobsApi } from "../../services/api.js";

const initialForm = { title: "", company: "", location: "", type: "Full-time", minSalary: "", maxSalary: "", description: "", skillsRequired: "" };

function StatCard({ icon: Icon, value, label, tint }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${tint}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-base text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function CreateJob() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await jobsApi.create({
        title: form.title,
        company: form.company || user?.company || "Default Company",
        location: form.location,
        type: form.type,
        salary: form.minSalary || form.maxSalary ? `$${form.minSalary || 0} - $${form.maxSalary || 0}` : "",
        description: form.description,
        skillsRequired: form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setMessage("Job created successfully.");
      setForm(initialForm);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create job.");
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white">
            <FileText className="h-8 w-8" />
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">JobFlow</h1>
            <span className="rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700">Recruiter</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-base">
          <span className="text-slate-500">{user?.company || user?.name || "Recruiter"}</span>
          <NavLink to="/" className="font-semibold text-slate-950">Logout</NavLink>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-4">
        <StatCard icon={FileText} value={"-"} label="Total Jobs" tint="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} value={"-"} label="Active Jobs" tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} value={"-"} label="Applicants" tint="bg-amber-50 text-amber-600" />
        <StatCard icon={Calendar} value={0} label="Interviews" tint="bg-sky-50 text-sky-600" />
      </div>

      <div className="mt-10 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-8">
          <Link to="/recruiter/manage" className="flex items-center gap-3 border-b-2 border-transparent pb-3 text-base text-slate-600 transition hover:text-blue-600">
            <FileText className="h-6 w-6" />
            My Jobs
          </Link>
          <Link to="/recruiter/manage" className="flex items-center gap-3 border-b-2 border-transparent pb-3 text-base text-slate-600 transition hover:text-blue-600">
            <Users className="h-6 w-6" />
            Applicants
          </Link>
          <span className="flex items-center gap-3 border-b-2 border-blue-600 pb-3 text-base text-blue-600">
            <Plus className="h-6 w-6" />
            Create Job
          </span>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-950">Job Title</label>
            <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. Senior Frontend Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Location</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. San Francisco, CA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Job Type</label>
              <select className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Contract</option>
              </select>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Min Salary</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. 80000" value={form.minSalary} onChange={(e) => setForm({ ...form, minSalary: e.target.value })} />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Max Salary</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. 120000" value={form.maxSalary} onChange={(e) => setForm({ ...form, maxSalary: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-950">Job Description</label>
            <textarea className="min-h-52 w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-950">Required Skills (comma separated)</label>
            <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. React, TypeScript, Node.js" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          </div>

          <button className="rounded-3xl bg-blue-600 px-8 py-5 text-base font-semibold text-white shadow-sm hover:bg-blue-700">Create Job</button>
          {message ? <p className="text-base text-emerald-600">{message}</p> : null}
        </form>
      </div>
    </Layout>
  );
}

export default CreateJob;
