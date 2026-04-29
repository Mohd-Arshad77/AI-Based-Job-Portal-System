import { useEffect, useRef, useState, useCallback } from "react";
import Layout from "../../components/Layout.jsx";
import {
  User, Mail, Phone, Briefcase, GraduationCap, Code,
  MapPin, Upload, X, Check, FileText, PlusCircle,
  CheckCircle, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // Snapshot of the original data to detect changes
  const initialDataRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    education: user?.education || "",
    experience: user?.experience ?? "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(user?.skills || []);
  const [resume, setResume] = useState(user?.resumeUrl || "");
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState(user?.resumeUpdatedAt || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Compare current state with original to detect changes
  const hasChanges = useCallback(() => {
    if (!initialDataRef.current) return false;
    const orig = initialDataRef.current;
    if (form.name !== orig.name) return true;
    if (form.phone !== orig.phone) return true;
    if (form.location !== orig.location) return true;
    if (form.education !== orig.education) return true;
    if (String(form.experience) !== String(orig.experience)) return true;
    if (JSON.stringify([...skills].sort()) !== JSON.stringify([...orig.skills].sort())) return true;
    return false;
  }, [form, skills]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        setUser(data);
      } catch (error) {
        showToast(error.response?.data?.message || "Could not load profile.", "error");
      }
    };
    loadProfile();
  }, [setUser]);

  useEffect(() => {
    const snapshot = {
      name: user?.name || "",
      phone: user?.phone || "",
      location: user?.location || "",
      education: user?.education || "",
      experience: user?.experience ?? "",
      skills: user?.skills || []
    };
    initialDataRef.current = snapshot;
    setForm({
      name: snapshot.name,
      phone: snapshot.phone,
      location: snapshot.location,
      education: snapshot.education,
      experience: snapshot.experience
    });
    setSkills(snapshot.skills);
    setResume(user?.resumeUrl || "");
    setResumeUpdatedAt(user?.resumeUpdatedAt || "");
  }, [user]);

  // Handle Enter key in skill input
  const addSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (!skillInput.trim()) return;

      const nextSkill = skillInput.trim();
      const exists = skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase());

      if (!exists) {
        setSkills((prev) => [...prev, nextSkill]);
        setSkillInput(""); // Clear input only on success
      } else {
        showToast(`"${nextSkill}" is already in your skills list.`, "error");
      }
    }
  };

  // + button add a skill on click
  const addSkillByClick = () => {
    if (!skillInput.trim()) return;
    const nextSkill = skillInput.trim();
    const exists = skills.some((s) => s.toLowerCase() === nextSkill.toLowerCase());

    if (!exists) {
      setSkills((prev) => [...prev, nextSkill]);
      setSkillInput(""); // Clear input only on success
    } else {
      showToast(`"${nextSkill}" is already in your skills list.`, "error");
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
    return new Date(resumeUpdatedAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      showToast("No changes detected.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await profileApi.updateProfile({
        name: form.name,
        education: form.education,
        experience: form.experience,
        phone: form.phone,
        location: form.location,
        skills: skills
      });

      setUser(data.user);
      showToast("Profile updated successfully.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await profileApi.uploadResume(formData);
      setUser(data.user);
      setResume(data.user.resumeUrl || "");
      setResumeUpdatedAt(data.user.resumeUpdatedAt || "");
      showToast("Resume uploaded successfully.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not upload resume.", "error");
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  // Modern UI Styles
  const labelStyle = "block text-[13px] font-semibold text-slate-700 mb-1.5";
  const inputStyle = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-[3px] focus:ring-indigo-500/10";
  const iconWrapperStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400";

  return (
    <Layout title="Profile Settings">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Personal Information</h1>
          <p className="text-sm text-slate-500 mt-1">Update your photo, personal details, and professional experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Avatar & Resume */}
          <div className="lg:w-1/3 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-sm">
              <div className="relative mx-auto w-28 h-28 mb-5">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-4 ring-white">
                  <User size={48} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{form.name || "Your Name"}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1 mb-8">{user?.email}</p>

              <hr className="border-slate-100 mb-8" />

              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500" />
                  Your Resume
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleResumeChange}
                />

                {resume ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {getResumeFileName(resume)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatResumeDate(resumeUpdatedAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingResume}
                      className="w-full rounded-xl bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 text-sm font-semibold transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUploadingResume ? "Uploading..." : "Replace File"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="group w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="mx-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                      <Upload className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                    </div>
                    <span className="block text-sm font-semibold text-slate-700 group-hover:text-indigo-700">
                      {isUploadingResume ? "Uploading..." : "Click to upload"}
                    </span>
                    <span className="block text-xs text-slate-500 mt-1">PDF (Max. 5MB)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:w-2/3">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 space-y-8">

                {/* Contact Info Section */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Full Name</label>
                      <div className="relative">
                        <User size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Email Address</label>
                      <div className="relative">
                        <Mail size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11 opacity-60 cursor-not-allowed bg-slate-100/50`} value={user?.email || ""} disabled />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Location</label>
                      <div className="relative">
                        <MapPin size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11`} placeholder="e.g. Kozhikode, Kerala" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Professional Info Section */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Education</label>
                      <div className="relative">
                        <GraduationCap size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11`} placeholder="e.g. BCA / B.Tech" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Years of Experience</label>
                      <div className="relative">
                        <Briefcase size={18} className={iconWrapperStyle} />
                        <input className={`${inputStyle} pl-11`} type="number" placeholder="e.g. 2" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelStyle}>Skills & Technologies</label>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        {/* Skill badges */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="flex items-center gap-1.5 bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 shadow-sm transition-all"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full p-0.5 transition-colors"
                                  title="Remove skill"
                                >
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Skill input row */}
                        <div className="flex gap-3 items-center">
                          <div className="relative flex-1">
                            <Code size={18} className={iconWrapperStyle} />
                            <input
                              className={`${inputStyle} pl-11`}
                              placeholder="Type a skill..."
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={addSkill}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addSkillByClick}
                            disabled={!skillInput.trim()}
                            title="Add skill"
                            className="flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm shadow-indigo-600/20"
                          >
                            <PlusCircle size={20} className="mr-2" /> Add
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                        Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">Enter</kbd> to add quickly.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sticky-style Save Action Bar */}
              <div
                className={`bg-slate-50 border-t border-slate-200 p-4 px-8 flex items-center justify-between transition-all duration-300 ease-in-out ${hasChanges()
                  ? "opacity-100 bg-indigo-50/30"
                  : "opacity-50 grayscale pointer-events-none"
                  }`}
              >
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  {hasChanges() && <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>}
                  {hasChanges() ? "You have unsaved changes" : "Up to date"}
                </p>
                <button
                  type="submit"
                  disabled={isSaving || !hasChanges()}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>

      {/* Modern Toast Notification Overlay */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
          }`}
      >
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl shadow-slate-200/50 border bg-white min-w-[300px] ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"
          }`}>
          {toast.type === "success" ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle size={18} strokeWidth={2.5} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle size={18} strokeWidth={2.5} />
            </div>
          )}

          <div className="flex-1">
            <h4 className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-900" : "text-rose-900"}`}>
              {toast.type === "success" ? "Success" : "Notice"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
          </div>

          <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={16} />
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;