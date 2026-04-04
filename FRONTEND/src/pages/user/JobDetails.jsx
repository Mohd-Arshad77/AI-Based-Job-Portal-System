import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Building2, MapPin, X, UploadCloud } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate പുതുതായി ചേർത്തു
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { applicationsApi, jobsApi } from "../../services/api.js";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // വഴിതിരിച്ചുവിടാൻ ഇത് ഉപയോഗിക്കുന്നു
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  
  // Modal & Application States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalError, setModalError] = useState(""); // പോപ്പ്-അപ്പിൽ എറർ കാണിക്കാൻ പുതിയ State
  const [applyForm, setApplyForm] = useState({
    resume: null,
    name: user?.name || "",
    experience: user?.experience || "",
  });

  useEffect(() => {
    jobsApi.getById(id).then(({ data }) => setJob(data)).catch(() => setJob(null));

    if (user?.role === "user") {
      applicationsApi.list()
        .then(({ data }) => {
          const alreadyApplied = data.some((app) => (app.job?._id || app.job) === id);
          setHasApplied(alreadyApplied);
        })
        .catch(() => setHasApplied(false));
    }
  }, [id, user]);

  const submitApplication = async (e) => {
    e.preventDefault();
    setModalError(""); // പഴയ എററുകൾ മായ്ക്കാൻ
    
    // 1. റെസ്യൂമെ ഇല്ലെങ്കിൽ ഉള്ള എറർ
    if (!applyForm.resume) {
      setModalError("⚠️ Please upload your resume to continue.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("resume", applyForm.resume);
      formData.append("name", applyForm.name);
      formData.append("experience", applyForm.experience);
      formData.append("jobTitle", job.title);

      await applicationsApi.apply(id, formData); 

      // 2. വിജയകരമായി സബ്മിറ്റ് ചെയ്താൽ നടക്കേണ്ട കാര്യങ്ങൾ
      setHasApplied(true);
      setIsSubmitted(true);
      
      // അലർട്ട് ഒഴിവാക്കി, ഒരു സക്സസ് വിൻഡോ കാണിച്ച് 3 സെക്കൻഡിനു ശേഷം ഹോമിലേക്ക് പോകുന്നു
      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/"); 
      }, 3500);

    } catch (error) {
      setModalError(error.response?.data?.message || "Could not submit application.");
    }
  };

  if (!job) {
    return <Layout title="Job Details" subtitle="View the selected job."><p className="text-sm text-slate-500">Job not found.</p></Layout>;
  }

  return (
    <Layout title={job.title} subtitle={`${job.company} • ${job.location}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><Building2 className="h-4 w-4 text-slate-500" />{job.company}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><MapPin className="h-4 w-4 text-slate-500" />{job.location}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><BadgeCheck className="h-4 w-4 text-slate-500" />{job.type}</span>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600 whitespace-pre-line">{job.description}</p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-950">Skills Required</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.skillsRequired || []).map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <p className="text-sm text-slate-500">Salary</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{job.salary || "Competitive"}</p>
          <p className="mt-4 text-sm text-slate-500">Experience</p>
          <p className="mt-2 text-slate-900">{job.experienceRequired || "Not specified"}</p>

          {user?.role === "user" ? (
            hasApplied ? (
              <button 
                disabled
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-5 py-4 text-sm font-semibold text-emerald-700 cursor-not-allowed"
              >
                <BadgeCheck className="h-5 w-5" />
                Already Applied
              </button>
            ) : (
              <button 
                onClick={() => {
                  setMessage("");
                  setModalError(""); // തുറക്കുമ്പോൾ എറർ മാറ്റുന്നു
                  setIsModalOpen(true);
                }} 
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </button>
            )
          ) : null}

          {message ? (
            <p className={`mt-4 text-sm font-medium ${message.includes("success") ? "text-emerald-600" : "text-rose-600"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl transition-all">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-10 relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 border-[6px] border-white shadow-xl shadow-emerald-500/10">
                    <svg className="h-14 w-14 text-emerald-500 translate-x-1 -translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22 11 13 2 9 22 2z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-snug">Your application has been<br/>submitted!</h2>
                <p className="mt-4 text-base font-medium text-slate-500">Redirecting to home page...</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Application</h2>
              <p className="mt-1 text-sm text-slate-500">Provide your details to apply for <span className="font-semibold text-slate-700">{job.title}</span> at {job.company}.</p>
            </div>

            {/* എറർ മെസ്സേജ് ഇവിടെ കാണിക്കും */}
            {modalError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-100 flex items-center gap-2">
                <span className="text-lg">⚠️</span> {modalError}
              </div>
            )}

            <form onSubmit={submitApplication} className="space-y-5">
              
              {/* 1. Resume Upload */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                <label className="mb-2 block text-sm font-semibold text-slate-900">Resume Document</label>
                <div className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all duration-200 ${applyForm.resume ? 'border-emerald-400 bg-emerald-50 shadow-sm' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'}`}>
                  <label className="flex w-full cursor-pointer flex-col items-center text-center">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${applyForm.resume ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      <UploadCloud className={`h-6 w-6 ${applyForm.resume ? 'text-emerald-600' : 'text-blue-600'}`} />
                    </div>
                    <span className="text-base font-medium text-slate-700">
                      {applyForm.resume ? applyForm.resume.name : "Click to browse finding your resume"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">Supported formats: PDF, DOCX</span>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      className="hidden" 
                      onChange={(e) => {
                        setApplyForm({...applyForm, resume: e.target.files[0]});
                        setModalError(""); // ഫയൽ സെലക്ട് ചെയ്യുമ്പോൾ എറർ മാറ്റുന്നു
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 3. Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your full name"
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({...applyForm, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* 4. Experience */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Years of Experience</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    placeholder="e.g. 5"
                    value={applyForm.experience}
                    onChange={(e) => setApplyForm({...applyForm, experience: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30">
                  Confirm Application <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
            </form>
            </>
            )}
          </div>
        </div>
      )}

    </Layout>
  );
}

export default JobDetails;
