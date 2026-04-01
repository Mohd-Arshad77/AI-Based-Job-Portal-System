import { useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { profileApi } from "../services/portalService.js";

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    experience: user?.experience || "",
    education: user?.education || "",
    skills: (user?.skills || []).join(", ")
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await profileApi.updateProfile({
        ...form,
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Backend unavailable. You can still browse in demo mode.");
    }
  };

  return (
    <Layout title="Profile" subtitle="Update the information that powers matching, recommendations, and recruiter confidence.">
      <SectionCard title="Edit Profile" description="Changes are persisted through the API when available.">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none" placeholder="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <textarea className="min-h-32 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <textarea className="min-h-24 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Skills comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <button className="rounded-[1.5rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 md:col-span-2">Save Profile</button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      </SectionCard>
    </Layout>
  );
}

export default Profile;
