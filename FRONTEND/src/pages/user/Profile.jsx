import { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout.jsx";
import { User, Mail, Phone, Briefcase, GraduationCap, Code, MapPin, Upload, X, Check, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    education: user?.education || "",
    experience: user?.experience ?? "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(user?.skills || []);
  const [resume, setResume] = useState(user?.resume || user?.resumeUrl || "");
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState(user?.resumeUpdatedAt || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [resumeMessage, setResumeMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        setUser(data);
      } catch (error) {
        setProfileMessage(error.response?.data?.message || "Could not load profile.");
      }
    };

    loadProfile();
  }, [setUser]);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      location: user?.location || "",
      education: user?.education || "",
      experience: user?.experience ?? ""
    });
    setSkills(user?.skills || []);
    setResume(user?.resume || user?.resumeUrl || "");
    setResumeUpdatedAt(user?.resumeUpdatedAt || "");
  }, [user]);

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();

      const nextSkill = skillInput.trim();
      const exists = skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase());

      if (!exists) {
        setSkills([...skills, nextSkill]);
      }

      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const getResumeFileName = (resumeUrl) => {
    if (!resumeUrl) return "";
    return resumeUrl.split("/").pop();
  };

  const formatResumeDate = (resumeUpdatedAt) => {
    if (!resumeUpdatedAt) return "Date not available";
    return new Date(resumeUpdatedAt).toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage("");

    try {
      const { data } = await profileApi.updateProfile({
        education: form.education,
        experience: form.experience,
        phone: form.phone,
        location: form.location,
        skills: skills
      });

      setUser(data.user);
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
        education: data.user.education || "",
        experience: data.user.experience ?? ""
      });
      setSkills(data.user.skills || []);
      setResume(data.user.resume || data.user.resumeUrl || "");
      setResumeUpdatedAt(data.user.resumeUpdatedAt || "");
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(error.response?.data?.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingResume(true);
    setResumeMessage("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await profileApi.uploadResume(formData);
      setUser(data.user);
      setResume(data.user.resume || data.resume || data.user.resumeUrl || "");
      setResumeUpdatedAt(data.user.resumeUpdatedAt || "");
      setResumeMessage("Resume updated successfully.");
    } catch (error) {
      setResumeMessage(error.response?.data?.message || "Could not upload resume.");
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  const labelStyle = "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2";
  const inputStyle = "w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5";

  return (
    <Layout title="Profile Settings">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 p-4">
        <div className="lg:w-1/3 space-y-6">
          <div className="rounded-[32px] bg-white border border-slate-100 p-8 text-center shadow-sm">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <User size={40} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800">{form.name || "Full Name"}</h2>
            <p className="text-sm text-slate-400 mb-6">{user?.email}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleResumeChange}
            />

            {resume ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {getResumeFileName(resume)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded on {formatResumeDate(resumeUpdatedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploadingResume ? "Uploading..." : "Replace Resume"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume}
                className="group w-full rounded-2xl border-2 border-dashed border-slate-100 p-4 text-center transition-all hover:border-blue-500 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Upload className="mx-auto mb-2 text-slate-300 group-hover:text-blue-500" size={20} />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">
                  {isUploadingResume ? "Uploading..." : "Upload Resume"}
                </span>
              </button>
            )}

            {resumeMessage && (
              <p className={`mt-4 text-sm ${resumeMessage.includes("successfully") ? "text-emerald-600" : "text-rose-600"}`}>
                {resumeMessage}
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-2/3 space-y-6">
          <div className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className={labelStyle}><User size={14} /> Full Name</label>
                <input className={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className={labelStyle}><Mail size={14} /> Email (Verified)</label>
                <input className={`${inputStyle} opacity-60 cursor-not-allowed`} value={user?.email || ""} disabled />
              </div>

              <div>
                <label className={labelStyle}><Phone size={14} /> Phone</label>
                <input className={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div>
                <label className={labelStyle}><MapPin size={14} /> Location</label>
                <input className={inputStyle} placeholder="e.g. Kozhikode, Kerala" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>

              <div>
                <label className={labelStyle}><GraduationCap size={14} /> Education</label>
                <input className={inputStyle} placeholder="BCA / B.Tech" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>

              <div>
                <label className={labelStyle}><Briefcase size={14} /> Years of Experience</label>
                <input className={inputStyle} type="number" placeholder="e.g. 2" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}><Code size={14} /> Skills & Technologies</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <span key={skill} onClick={() => removeSkill(skill)} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-800"><X size={12} /></button>
                    </span>
                  ))}
                </div>

                <input
                  className={inputStyle}
                  placeholder="Type skill and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70">
                <Check size={18} /> {isSaving ? "Updating..." : "Update Profile"}
              </button>
            </div>

            {profileMessage && (
              <p className={`mt-4 text-sm text-right ${profileMessage.includes("successfully") ? "text-emerald-600" : "text-rose-600"}`}>
                {profileMessage}
              </p>
            )}
          </div>
        </div>
      </form>
    </Layout>
  );
}

export default Profile;
