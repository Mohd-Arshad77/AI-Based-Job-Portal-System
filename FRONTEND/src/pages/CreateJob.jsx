import { useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { jobsApi } from "../services/portalService.js";

function CreateJob() {
  const [form, setForm] = useState({ title: "", company: "", location: "", experienceRequired: "", skillsRequired: "", description: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await jobsApi.create({
        ...form,
        skillsRequired: form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setMessage("Job created successfully.");
      setForm({ title: "", company: "", location: "", experienceRequired: "", skillsRequired: "", description: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Backend unavailable. Job creation requires the API.");
    }
  };

  return (
    <Layout title="Create Job" subtitle="Post polished new hiring requirements for approval and candidate discovery.">
      <SectionCard title="Job Form">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Experience Required" value={form.experienceRequired} onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })} />
          <textarea className="min-h-24 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Skills Required comma separated" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          <textarea className="min-h-32 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="rounded-[1.5rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 md:col-span-2">Create Job</button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      </SectionCard>
    </Layout>
  );
}

export default CreateJob;
