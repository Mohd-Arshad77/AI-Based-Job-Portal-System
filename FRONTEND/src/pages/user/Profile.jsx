import { useState } from "react";
import Layout from "../../components/Layout.jsx";
import { profileApi } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

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
      setMessage(error.response?.data?.message || "Could not update profile.");
    }
  };

  return (
    <Layout title="Profile" subtitle="View and update your basic profile information.">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <textarea className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <textarea className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" placeholder="Skills comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <button className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white md:col-span-2 hover:bg-blue-700">Save Profile</button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      </div>
    </Layout>
  );
}

export default Profile;
