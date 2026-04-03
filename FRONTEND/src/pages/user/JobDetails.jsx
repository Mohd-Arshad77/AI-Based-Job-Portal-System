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
      setIsModalOpen(false); 
      setHasApplied(true);
      
      // ഒരു ചെറിയ അലർട്ട് കാണിച്ച് നേരെ Applications പേജിലേക്ക് കൊണ്ടുപോകുന്നു
      alert("Application submitted successfully! 🎉");
      navigate("/applications"); 

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
        
        {/* === Left Side: Job Information === */}
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

        {/* === Right Side: Apply Section === */}
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

      {/* ================= APPLY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-700">
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">Apply for Role</h2>
            <p className="text-sm text-slate-500 mb-6">Upload your resume and confirm your details.</p>

            {/* എറർ മെസ്സേജ് ഇവിടെ കാണിക്കും */}
            {modalError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">
                {modalError}
              </div>
            )}

            <form onSubmit={submitApplication} className="space-y-5">
              
              {/* 1. Resume Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">1. Upload Resume (PDF/Word)</label>
                <div className={`flex w-full items-center justify-center rounded-xl border-2 border-dashed px-6 py-5 transition-colors ${applyForm.resume ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                  <label className="flex cursor-pointer flex-col items-center text-center w-full">
                    <UploadCloud className={`mb-2 h-7 w-7 ${applyForm.resume ? 'text-emerald-500' : 'text-blue-500'}`} />
                    <span className="text-sm font-medium text-slate-600">
                      {applyForm.resume ? applyForm.resume.name : "Click to browse file"}
                    </span>
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

              {/* 2. Job Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">2. Job Title</label>
                <input 
                  type="text" 
                  value={job.title}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* 3. Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">3. Full Name</label>
                <input 
                  required
                  type="text" 
                  value={applyForm.name}
                  onChange={(e) => setApplyForm({...applyForm, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* 4. Experience */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">4. Experience (Years)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  placeholder="e.g. 2"
                  value={applyForm.experience}
                  onChange={(e) => setApplyForm({...applyForm, experience: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="mt-4 w-full rounded-xl bg-blue-600 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700">
                Submit Application
              </button>
              
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default JobDetails;