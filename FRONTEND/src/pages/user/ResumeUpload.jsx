import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Sparkles, Cpu, Briefcase, X } from "lucide-react";
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileApi } from "../../services/api.js";

function ResumeUpload() {
  const { setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Select a PDF resume first.");
      return;
    }

    setIsUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data: uploadData } = await profileApi.uploadResume(formData);
      setUser(uploadData.user);
      const { data } = await profileApi.parseResume(formData);
      setParsed(data.parsedData);
      setMessage("Resume successfully analyzed and synced.");
    } catch (error) {
      setParsed(null);
      setMessage(error.response?.data?.message || "Could not parse resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout 
      title="Resume Intelligence" 
      subtitle="Upload your resume and let our AI extract your latent skills and achievements."
    >
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-950">Document Upload</h2>
              <p className="mt-1 text-sm text-slate-500">Provide your latest CV in PDF format.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!file ? (
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-all hover:border-indigo-300 hover:bg-indigo-50/50">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-indigo-950">Click to upload PDF</span>
                  <span className="mt-1 text-xs text-slate-500">Maximum file size 5MB</span>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      setMessage("");
                    }} 
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-indigo-950">{file.name}</p>
                      <p className="text-xs text-indigo-700/70">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFile(null);
                      setParsed(null);
                      setMessage("");
                    }} 
                    className="ml-4 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-rose-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!file || isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract Insights
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${
                message.includes("success") 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}>
                {message.includes("success") ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                )}
                <p className="font-medium">{message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              Cognitive Profile Data
            </h2>
            {parsed && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                Synced
              </span>
            )}
          </div>

          {parsed ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Professional Summary</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm leading-relaxed text-slate-700">{parsed.summary}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(parsed.skills || []).length > 0 ? (
                    parsed.skills.map((skill) => (
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

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Notable Projects & Experience</p>
                {(parsed.projects || []).length > 0 ? (
                  <ul className="space-y-3">
                    {parsed.projects.map((project, index) => (
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
                Upload your resume on the left to see how our AI translates your experience into structured data.
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default ResumeUpload;
