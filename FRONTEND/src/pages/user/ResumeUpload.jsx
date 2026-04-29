import { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Sparkles, Cpu, Briefcase, X, Save } from "lucide-react";
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

  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);   // uploading the file
  const [isExtracting, setIsExtracting] = useState(false); // running AI extraction
  const [isSavingProfile, setIsSavingProfile] = useState(false); // saving parsed data to DB

  // ---------- Load profile on mount ----------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        setUser(data);
        // Task 3: Show already-saved data without confusion
        setResumeUrl(data.resumeUrl || "");
        if (data.parsedData && (data.parsedData.summary || (data.parsedData.skills || []).length > 0)) {
          setSavedData(data.parsedData);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || "Could not load profile.");
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
    setParsed(null); // reset any previous extraction preview
    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const { data } = await profileApi.uploadResume(formData);
      setUser(data.user);
      // Task 4: only use resumeUrl
      setResumeUrl(data.user?.resumeUrl || "");
      setMessage("Resume uploaded. Click \"Extract Insights\" to analyse it.");
    } catch (error) {
      setFile(null);
      setMessage(error.response?.data?.message || "Could not upload resume. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------- STEP 2: Extract (parse only — does NOT auto-save profile skills) ----------
  const handleExtract = async (e) => {
    e.preventDefault();
    if (!resumeUrl && !file) {
      setMessage("Please upload a resume first.");
      return;
    }

    setIsExtracting(true);
    setMessage("");

    const formData = new FormData();
    // Send the already-uploaded file for parsing (or re-use the current file object)
    if (file) formData.append("resume", file);

    try {
      const { data } = await profileApi.parseResume(formData);
      // Show extracted data in UI — user must explicitly save it
      setParsed(data.parsedData);
      setMessage("Extraction complete! Review the data below, then click \"Save Profile Data\".");
    } catch (error) {
      setParsed(null);
      setMessage(error.response?.data?.message || "Could not parse resume. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  // ---------- STEP 3: Save parsed data explicitly ----------
  const handleSaveProfile = async () => {
    if (!parsed) return;
    setIsSavingProfile(true);
    setMessage("");

    try {
      // Issue 2 Fix: send BOTH skills and the full parsedData object.
      // The backend uses $set, which completely replaces the old arrays —
      // so skills from a previous resume are wiped on every new save.
      const { data } = await profileApi.updateProfile({
        skills: parsed.skills || [],
        parsedData: parsed                // ← persists summary + projects too
      });
      setUser(data.user);
      setSavedData(parsed); // promote preview → saved
      setParsed(null);       // clear preview
      setFile(null);
      setMessage("Profile data saved successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save profile data.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // The data to display in the right panel (preview takes priority over saved)
  const displayData = parsed || savedData;
  const isSaved = !parsed && !!savedData; // true when showing DB data (not a fresh preview)

  return (
    <Layout
      title="Resume Intelligence"
      subtitle="Upload your resume and let our AI extract your latent skills and achievements."
    >
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

        {/* ── Left Panel: Upload & Extract ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-950">Document Upload</h2>
              <p className="mt-1 text-sm text-slate-500">Provide your latest CV in PDF format.</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {/* Drop zone / file preview */}
            {!file && !resumeUrl ? (
              <label
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-all hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm group-hover:bg-indigo-100 transition-colors">
                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-indigo-950">Click to upload PDF</span>
                <span className="mt-1 text-xs text-slate-500">Maximum file size 5MB</span>
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-indigo-950">
                      {file?.name || getResumeFileName(resumeUrl)}
                    </p>
                    <p className="text-xs text-indigo-700/70">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Saved resume"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-4 rounded-full p-1.5 text-xs font-semibold text-slate-400 hover:bg-white hover:text-rose-500 transition-colors"
                >
                  Replace
                </button>
              </div>
            )}

            {/* Upload spinner shown when uploading */}
            {isUploading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700" />
                Uploading file…
              </div>
            )}

            {/* ── Extract Insights button (STEP 2) ── */}
            <form onSubmit={handleExtract} className="mt-6">
              <button
                type="submit"
                disabled={(!resumeUrl && !file) || isExtracting || isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExtracting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Analysing Document…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract Insights
                  </>
                )}
              </button>
            </form>

            {/* ── Save Profile Data button (STEP 3) — only shown after a fresh extraction ── */}
            {parsed && (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile Data
                  </>
                )}
              </button>
            )}

            {/* Status message */}
            {message && (
              <div className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${
                message.includes("success") || message.includes("Review") || message.includes("Click")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}>
                {message.includes("success") || message.includes("Review") || message.includes("Click") ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                )}
                <p className="font-medium">{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Cognitive Profile Data ── */}
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              Cognitive Profile Data
            </h2>
            {displayData && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${
                isSaved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}>
                {isSaved ? "Saved to Profile" : "Preview — Not Saved Yet"}
              </span>
            )}
          </div>

          {displayData ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Summary */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Professional Summary</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {displayData.summary || "No summary available."}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(displayData.skills || []).length > 0 ? (
                    displayData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No specific skills detected.</span>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Notable Projects &amp; Experience</p>
                {(displayData.projects || []).length > 0 ? (
                  <ul className="space-y-3">
                    {displayData.projects.map((project, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:border-indigo-100 hover:bg-slate-50/50"
                      >
                        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-sm leading-relaxed text-slate-700">{project}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No project details detected.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Sparkles className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Awaiting Document</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Upload your resume on the left, then click "Extract Insights" to see how our AI translates your experience into structured data.
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default ResumeUpload;
