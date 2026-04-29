import { useEffect, useRef, useState, useCallback } from "react";
import Layout from "../../components/Layout.jsx";
import {
  User, Mail, Phone, Briefcase, GraduationCap, Code,
  MapPin, Upload, X, Check, FileText, Plus,
  CheckCircle2, AlertCircle, Sparkles, Activity
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
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
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

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

  // --- Interactive Feature: Calculate Profile Completion ---
  const calculateProgress = () => {
    let score = 0;
    if (form.name) score += 15;
    if (user?.email) score += 15; // Email is usually guaranteed
    if (form.phone) score += 15;
    if (form.location) score += 15;
    if (form.education) score += 10;
    if (form.experience !== "") score += 10;
    if (skills.length > 0) score += 10;
    if (resume) score += 10;
    return score;
  };
  const progress = calculateProgress();

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
    setForm(snapshot);
    setSkills(snapshot.skills);
    setResume(user?.resumeUrl || "");
    setResumeUpdatedAt(user?.resumeUpdatedAt || "");
  }, [user]);

  const addSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (!skillInput.trim()) return;
      const nextSkill = skillInput.trim();
      if (!skills.some((s) => s.toLowerCase() === nextSkill.toLowerCase())) {
        setSkills((prev) => [...prev, nextSkill]);
        setSkillInput("");
      } else {
        showToast(`"${nextSkill}" is already added.`, "error");
      }
    }
  };

  const addSkillByClick = () => {
    if (!skillInput.trim()) return;
    const nextSkill = skillInput.trim();
    if (!skills.some((s) => s.toLowerCase() === nextSkill.toLowerCase())) {
      setSkills((prev) => [...prev, nextSkill]);
      setSkillInput("");
    } else {
      showToast(`"${nextSkill}" is already added.`, "error");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges()) return showToast("No changes detected.", "error");

    setIsSaving(true);
    try {
      const { data } = await profileApi.updateProfile({ ...form, skills });
      setUser(data.user);
      showToast("Profile synced successfully.", "success");
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
      showToast("Resume processed successfully.", "success");
    } catch (error) {
      showToast("Upload failed.", "error");
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  // Interactive Input Component
  const InteractiveInput = ({ icon: Icon, label, value, onChange, disabled, type = "text", placeholder = "" }) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-violet-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium transition-all duration-300
          focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none hover:border-zinc-300
          ${disabled ? 'opacity-60 cursor-not-allowed bg-zinc-100' : ''}
        `}
      />
      <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[12px] font-bold text-zinc-500 tracking-wide uppercase transition-colors group-focus-within:text-violet-600">
        {label}
      </label>
    </div>
  );

  return (
    <Layout title="Profile Settings">
      <div className="min-h-screen bg-white text-zinc-900 p-4 sm:p-8 font-sans">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-8">

          {/* Left Column: Interactive Stats & Resume */}
          <div className="xl:w-[320px] shrink-0 space-y-6">

            {/* Real-time Progress Card */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-[32px] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-violet-500/20" />

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold text-zinc-900">Profile Status</h3>
              </div>

              <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E4E4E7" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray={`${progress}, 100`} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-zinc-900">{progress}%</span>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-zinc-500">
                {progress === 100 ? "All set! You're ready to go." : "Complete your profile to stand out."}
              </p>
            </div>

            {/* Resume Upload Box */}
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[32px] p-6 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all cursor-pointer group" onClick={() => !isUploadingResume && fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeChange} />

              <div className="w-14 h-14 bg-zinc-100 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                {resume ? <FileText size={24} className="text-violet-600" /> : <Upload size={24} className="text-zinc-500 group-hover:text-violet-600" />}
              </div>

              <h4 className="font-bold text-zinc-900 mb-1">{isUploadingResume ? "Uploading..." : resume ? "Resume Uploaded" : "Upload Resume"}</h4>
              <p className="text-xs text-zinc-500 font-medium">
                {resume ? resume.split("/").pop() : "Drag & drop or click to browse (PDF)"}
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-10">

              <div className="flex items-center gap-3 mb-8">
                <Sparkles size={24} className="text-violet-500" />
                <h2 className="text-2xl font-extrabold text-zinc-900">Personal Data</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mt-4">
                <InteractiveInput icon={User} label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <InteractiveInput icon={Mail} label="Email Address" value={user?.email || ""} disabled />
                <InteractiveInput icon={Phone} label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <InteractiveInput icon={MapPin} label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                <InteractiveInput icon={GraduationCap} label="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="Degree / Institution" />
                <InteractiveInput icon={Briefcase} label="Experience (Years)" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="0" />
              </div>

              <div className="mt-10">
                <label className="block text-[12px] font-bold text-zinc-500 tracking-wide uppercase mb-3 ml-2">Technical Skills</label>
                <div className="p-2 border border-zinc-200 rounded-[24px] bg-zinc-50 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all flex flex-wrap items-center gap-2 min-h-[64px]">

                  {skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-2 bg-white text-zinc-800 px-4 py-2 rounded-xl text-[14px] font-bold border border-zinc-200 shadow-sm animate-in zoom-in duration-200">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md p-0.5 transition-colors">
                        <X size={14} strokeWidth={3} />
                      </button>
                    </span>
                  ))}

                  <div className="flex-1 min-w-[150px] relative flex items-center px-2">
                    <input
                      className="w-full bg-transparent border-none text-[15px] font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-0 py-2"
                      placeholder="Type a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                    />
                    <button type="button" onClick={addSkillByClick} disabled={!skillInput.trim()} className="absolute right-0 p-2 text-violet-600 hover:bg-violet-100 rounded-lg disabled:opacity-0 transition-all">
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>

      {/* Floating Save Action Bar */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${hasChanges() ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"}`}>
        <div className="bg-zinc-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-zinc-800">
          <span className="text-[14px] font-medium tracking-wide flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Unsaved changes
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-2.5 rounded-full font-bold text-[14px] transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? "Syncing..." : "Save Profile"}
            {!isSaving && <Check size={16} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed top-8 right-8 z-50 transition-all duration-400 transform ${toast.show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"}`}>
        <div className="bg-white px-5 py-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-4 min-w-[300px]">
          {toast.type === "success" ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
          <div className="flex-1">
            <p className="text-[15px] font-bold text-zinc-900">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;