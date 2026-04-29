import { useEffect, useRef, useState } from "react";
import {
  UploadCloud, FileText, CheckCircle2, Sparkles,
  Cpu, Briefcase, X, Save, AlertCircle, Loader2, ArrowRight
} from "lucide-react";
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

function ResumeUpload() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // --- State ---
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");

  // `parsed` = freshly extracted data (not yet saved)
  const [parsed, setParsed] = useState(null);
  // `savedData` = data already saved in DB (shown on revisit)
  const [savedData, setSavedData] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  // ---------- Load profile on mount ----------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        setUser(data);
        setResumeUrl(data.resumeUrl || "");
        if (data.parsedData && (data.parsedData.summary || (data.parsedData.skills || []).length > 0)) {
          setSavedData(data.parsedData);
        }
      } catch (error) {
        showToast(error.response?.data?.message || "Could not load profile.", "error");
      }
    };
    loadProfile();
  }, [setUser]);

  const getResumeFileName = (path) => {
    if (!path) return "";
    return path.split("/").pop();
  };

  // ---------- STEP 1: Upload file ----------
  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsed(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const { data } = await profileApi.uploadResume(formData);
      setUser(data.user);
      setResumeUrl(data.user?.resumeUrl || "");
      showToast("Resume uploaded successfully.", "success");
    } catch (error) {
      setFile(null);
      showToast(error.response?.data?.message || "Could not upload resume.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------- STEP 2: Extract ----------
  const handleExtract = async (e) => {
    e.preventDefault();
    if (!resumeUrl && !file) {
      showToast("Please upload a resume first.", "error");
      return;
    }

    setIsExtracting(true);

    const formData = new FormData();
    if (file) formData.append("resume", file);

    try {
      const { data } = await profileApi.parseResume(formData);
      setParsed(data.parsedData);
      showToast("Extraction complete! Review your data.", "success");
    } catch (error) {
      setParsed(null);
      showToast(error.response?.data?.message || "Could not parse resume.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  // ---------- STEP 3: Save parsed data ----------
  const handleSaveProfile = async () => {
    if (!parsed) return;
    setIsSavingProfile(true);

    try {
      const { data } = await profileApi.updateProfile({
        skills: parsed.skills || [],
        parsedData: parsed
      });
      setUser(data.user);
      setSavedData(parsed);
      setParsed(null);
      setFile(null);
      showToast("Profile data saved successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not save profile data.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayData = parsed || savedData;
  const isSaved = !parsed && !!savedData;

  return (
    <Layout
      title="Resume Intelligence"
      subtitle="Upload your resume and let our AI extract your latent skills and achievements."
    >
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] max-w-7xl mx-auto pb-24">

        {/* ── Left Panel: Upload & Extract ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                Document Upload
              </h2>
              <p className="mt-1 text-sm text-zinc-500 font-medium">Provide your latest CV in PDF format.</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {!file && !resumeUrl ? (
              <label
                onClick={() => fileInputRef.current?.click()}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-zinc-200 bg-zinc-50 py-12 transition-all hover:border-violet-400 hover:bg-violet-50/50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors text-zinc-400">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
                </div>
                <span className="text-[15px] font-bold text-zinc-800">
                  {isUploading ? "Uploading..." : "Click to upload PDF"}
                </span>
                <span className="mt-1.5 text-xs text-zinc-500 font-medium">Maximum file size 5MB</span>
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-[20px] border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-violet-200">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-zinc-900">
                      {file?.name || getResumeFileName(resumeUrl)}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Saved resume document"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isExtracting}
                  className="ml-4 rounded-xl px-3 py-2 text-xs font-bold text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm border border-transparent hover:border-zinc-200 transition-all disabled:opacity-50"
                >
                  Replace
                </button>
              </div>
            )}

            <form onSubmit={handleExtract} className="mt-8">
              <button
                type="submit"
                disabled={(!resumeUrl && !file) || isExtracting || isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-4 text-[15px] font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden relative group"
              >
                {/* Subtle animated background gradient for extraction state */}
                {isExtracting && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                )}

                {isExtracting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analysing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-violet-300 group-hover:text-violet-200 transition-colors" />
                    Extract AI Insights
                    <ArrowRight className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Panel: Cognitive Profile Data ── */}
        <div className="flex flex-col rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm relative overflow-hidden">

          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5 relative z-10">
            <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
              <Cpu className="h-6 w-6 text-violet-600" />
              Cognitive Profile Data
            </h2>
            {displayData && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase border ${isSaved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                }`}>
                {isSaved ? "Saved to Profile" : "Unsaved Preview"}
              </span>
            )}
          </div>

          {displayData ? (
            <div className="space-y-8 relative z-10">

              {/* Summary */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-zinc-400">Professional Summary</h3>
                <div className="rounded-[20px] border border-zinc-100 bg-zinc-50/50 p-6 leading-relaxed text-[15px] text-zinc-700 font-medium">
                  {displayData.summary || "No summary available."}
                </div>
              </div>

              {/* Skills */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-zinc-400">Extracted Technologies & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(displayData.skills || []).length > 0 ? (
                    displayData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-bold text-zinc-800 shadow-sm transition-all hover:border-violet-300 hover:text-violet-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[14px] text-zinc-500 font-medium italic">No specific skills detected.</span>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-zinc-400">Notable Experience & Projects</h3>
                {(displayData.projects || []).length > 0 ? (
                  <ul className="space-y-4">
                    {displayData.projects.map((project, index) => (
                      <li
                        key={index}
                        className="group flex items-start gap-4 rounded-[20px] border border-zinc-100 bg-white p-5 transition-all hover:border-violet-200 hover:shadow-md"
                      >
                        <div className="mt-0.5 rounded-lg bg-zinc-100 p-2 text-zinc-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="text-[14px] leading-relaxed text-zinc-700 font-medium">{project}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-zinc-500 font-medium italic">No project details detected.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm">
                <Sparkles className="h-10 w-10 text-zinc-300" />
              </div>
              <h3 className="text-xl font-extrabold text-zinc-900">Awaiting Document</h3>
              <p className="mt-3 max-w-md text-[15px] font-medium text-zinc-500 leading-relaxed">
                Upload your resume and click <strong className="text-zinc-700">Extract AI Insights</strong> to see how our engine translates your experience into structured data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Action Bar (Appears when there is unsaved parsed data) */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${parsed ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"
          }`}
      >
        <div className="bg-zinc-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-zinc-800">
          <span className="text-[14px] font-medium tracking-wide flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
            </span>
            New insights ready to save
          </span>
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-2.5 rounded-full font-bold text-[14px] transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSavingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSavingProfile ? "Saving..." : "Save to Profile"}
          </button>
        </div>
      </div>

      {/* Modern Toast Notification Overlay */}
      <div
        className={`fixed top-8 right-8 z-50 transition-all duration-400 transform ${toast.show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white px-5 py-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-4 min-w-[300px]">
          {toast.type === "success" ? (
            <CheckCircle2 size={24} className="text-emerald-500" />
          ) : (
            <AlertCircle size={24} className="text-rose-500" />
          )}
          <div className="flex-1">
            <p className="text-[15px] font-bold text-zinc-900">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Layout>
  );
}

export default ResumeUpload;