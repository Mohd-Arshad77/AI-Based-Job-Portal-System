import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { jobsApi } from "../services/portalService.js";
import { demoJobs } from "../data/demoData.js";

const emptyForm = { title: "", company: "", location: "", experienceRequired: "", skillsRequired: "", description: "" };

function ManageJobs() {
  const [jobs, setJobs] = useState(demoJobs);
  const [message, setMessage] = useState("");
  const [editingJobId, setEditingJobId] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    jobsApi.list().then(({ data }) => setJobs(data)).catch(() => setJobs(demoJobs));
  }, []);

  const startEdit = (job) => {
    setEditingJobId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      experienceRequired: job.experienceRequired || "",
      skillsRequired: (job.skillsRequired || []).join(", "),
      description: job.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingJobId("");
    setForm(emptyForm);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        skillsRequired: form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean)
      };
      const { data } = await jobsApi.update(editingJobId, payload);
      setJobs((current) => current.map((job) => (job._id === editingJobId ? data.job : job)));
      setMessage("Job updated successfully.");
      cancelEdit();
    } catch (error) {
      setMessage(error.response?.data?.message || "Backend unavailable. Changes are not persisted in demo mode.");
    }
  };

  const handleClose = async (id) => {
    try {
      await jobsApi.close(id);
      setJobs((current) => current.map((job) => (job._id === id ? { ...job, isActive: false } : job)));
      setMessage("Job closed successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Backend unavailable. Showing current data only.");
    }
  };

  return (
    <Layout title="Manage Jobs" subtitle="Track your openings, edit job details, and close roles when they are filled.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Posted Jobs">
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-slate-950/24 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{job.title}</p>
                    <p className="text-sm text-slate-400">{job.company} • Active: {job.isActive ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => startEdit(job)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">Edit</button>
                    <button onClick={() => handleClose(job._id)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10" disabled={!job.isActive}>
                      {job.isActive ? "Close Job" : "Closed"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        </SectionCard>

        <SectionCard title="Edit Job" description="Select a job from the list to update its details.">
          {editingJobId ? (
            <form onSubmit={handleUpdate} className="grid gap-4">
              <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Experience Required" value={form.experienceRequired} onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })} />
              <textarea className="min-h-24 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Skills Required comma separated" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
              <textarea className="min-h-32 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="flex gap-3">
                <button className="rounded-[1.5rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-4 py-3 font-semibold text-slate-950">Save Changes</button>
                <button type="button" onClick={cancelEdit} className="rounded-[1.5rem] border border-white/12 px-4 py-3 text-white">Cancel</button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-300">Choose a job from the list to start editing.</p>
          )}
        </SectionCard>
      </div>
    </Layout>
  );
}

export default ManageJobs;
