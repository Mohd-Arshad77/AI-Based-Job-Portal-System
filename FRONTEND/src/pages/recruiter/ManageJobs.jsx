import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MapPin,
  MoreVertical,
  PencilLine,
  Plus,
  Power,
  Users,
  Search,
  Filter
} from "lucide-react";
import Layout from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { applicationsApi, interviewApi, jobsApi } from "../../services/api.js";

const emptyForm = { title: "", company: "", location: "", experienceRequired: "", salary: "", skillsRequired: "", description: "" };
const initialCreateForm = { title: "", company: "", location: "", type: "Full-time", salary: "", description: "", skillsRequired: "" };
const initialInterviewForm = {
  applicationId: "",
  scheduledAt: "",
  mode: "Video Call",
  meetingLink: "",
  location: "",
  notes: ""
};
const statusOptions = ["Pending", "Shortlisted", "Rejected", "Hired"];

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col p-6 bg-white border-b sm:border-b-0 sm:border-r border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 text-gray-500 mb-3">
        <Icon className="w-5 h-5 text-indigo-600" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [message, setMessage] = useState("");
  
  const [activeTab, setActiveTab] = useState(() => (window.location.pathname.includes("create") ? "create" : "jobs"));
  
  const [detailsTab, setDetailsTab] = useState("info");

  const [editingJobId, setEditingJobId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [interviewForm, setInterviewForm] = useState(initialInterviewForm);
  const [createMessage, setCreateMessage] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState({ type: "", text: "" });
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
  
  const [searchFilters, setSearchFilters] = useState({ keyword: "", status: "", skills: "", experience: "" });

  const detailsRef = useRef(null);
  const editRef = useRef(null);
  const menuRefs = useRef({});

  const fetchInterviews = async () => {
    try {
      const { data } = await interviewApi.list();
      setInterviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      setInterviews([]);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [{ data: jobsData }, { data: applicationsData }] = await Promise.all([
          jobsApi.list(),
          applicationsApi.list()
        ]);

        setJobs(jobsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error("Failed to fetch recruiter dashboard data:", error);
        setJobs([]);
        setApplications([]);
      }
      await fetchInterviews();
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!openMenuId) return undefined;
    const handleClickOutside = (event) => {
      const activeMenu = menuRefs.current[openMenuId];
      if (activeMenu && !activeMenu.contains(event.target)) {
        setOpenMenuId("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const applicantsByJob = useMemo(() => applications.reduce((acc, application) => {
    const jobId = application.job?._id;
    if (jobId) {
      acc[jobId] = acc[jobId] || [];
      acc[jobId].push(application);
    }
    return acc;
  }, {}), [applications]);

  const interviewApplicationIds = useMemo(() => new Set(
    interviews.map((interview) => interview.application?._id || interview.application).filter(Boolean)
  ), [interviews]);

  const availableInterviewApplications = useMemo(() => applications.filter((application) => (
    application.status === "Shortlisted" && !interviewApplicationIds.has(application._id)
  )), [applications, interviewApplicationIds]);

  const selectedJob = useMemo(() => jobs.find((job) => job._id === selectedJobId) || null, [jobs, selectedJobId]);
  const totalApplicants = applications.length;
  const activeJobs = jobs.filter((job) => job.isActive).length;
  const scheduledInterviews = interviews;

  useEffect(() => {
    if (!availableInterviewApplications.length) {
      setInterviewForm((current) => (current.applicationId ? { ...current, applicationId: "" } : current));
      return;
    }
    const hasSelectedApplication = availableInterviewApplications.some((application) => application._id === interviewForm.applicationId);
    if (!hasSelectedApplication) {
      setInterviewForm((current) => ({ ...current, applicationId: availableInterviewApplications[0]._id }));
    }
  }, [availableInterviewApplications, interviewForm.applicationId]);

  const scrollToSection = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleViewJob = (job) => {
    setSelectedJobId(job._id);
    setDetailsTab("info");
    setOpenMenuId("");
    scrollToSection(detailsRef);
  };

  const startEdit = (job) => {
    setSelectedJobId(job._id);
    setEditingJobId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      salary: job.salary || "",
      experienceRequired: job.experienceRequired || "",
      skillsRequired: (job.skillsRequired || []).join(", "),
      description: job.description || ""
    });
    setOpenMenuId("");
    scrollToSection(editRef);
  };

  const cancelEdit = () => {
    setEditingJobId("");
    setForm(emptyForm);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        skillsRequired: form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean)
      };
      const { data } = await jobsApi.update(editingJobId, payload);
      setJobs((current) => current.map((job) => (job._id === editingJobId ? data.job : job)));
      setSelectedJobId(data.job._id);
      setMessage("Job updated successfully.");
      cancelEdit();
      scrollToSection(detailsRef);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update job.");
    }
  };

  const handleJobStatus = async (job, nextStatus) => {
    try {
      const { data } = await jobsApi.setStatus(job._id, nextStatus);
      setJobs((current) => current.map((item) => (item._id === job._id ? data.job : item)));
      setSelectedJobId(job._id);
      setMessage(data.message || (nextStatus ? "Job activated successfully." : "Job deactivated successfully."));
      setOpenMenuId("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update job status.");
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      await applicationsApi.updateStatus(applicationId, status);
      setApplications((current) => current.map((item) => (item._id === applicationId ? { ...item, status } : item)));
      setMessage(`Candidate status updated to ${status}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update application status.");
    }
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    try {
      const { data } = await jobsApi.create({
        title: createForm.title,
        company: createForm.company || user?.company || "Company",
        location: createForm.location,
        type: createForm.type,
        salary: createForm.salary || "",
        description: createForm.description,
        skillsRequired: createForm.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setCreateMessage("Job created successfully.");
      setCreateForm(initialCreateForm);
      setJobs((current) => [data.job, ...current]);
      setSelectedJobId(data.job._id);
      setActiveTab("jobs");
    } catch (error) {
      setCreateMessage(error.response?.data?.message || "Could not create job.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewForm.applicationId) return setInterviewFeedback({ type: "error", text: "Please select an applicant." });
    if (!interviewForm.scheduledAt) return setInterviewFeedback({ type: "error", text: "Please choose an interview date and time." });

    try {
      setIsSchedulingInterview(true);
      setInterviewFeedback({ type: "", text: "" });

      const payload = {
        applicationId: interviewForm.applicationId,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        mode: interviewForm.mode,
        meetingLink: interviewForm.meetingLink.trim(),
        location: interviewForm.location.trim(),
        notes: interviewForm.notes.trim()
      };

      const { data } = await interviewApi.create(payload);
      setInterviewFeedback({ type: "success", text: data.message || "Interview scheduled successfully." });
      
      await fetchInterviews();
      const { data: applicationsData } = await applicationsApi.list();
      setApplications(applicationsData);
      setInterviewForm((current) => ({ ...initialInterviewForm, mode: current.mode }));
    } catch (error) {
      setInterviewFeedback({ type: "error", text: error.response?.data?.message || "Could not schedule interview." });
    } finally {
      setIsSchedulingInterview(false);
    }
  };

  const formatInterviewDate = (value) => value ? new Date(value).toLocaleDateString() : "Date not set";
  const formatInterviewTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time not set";

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
      case "pending": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Pending</span>;
      case "interview":
      case "shortlisted": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Shortlisted</span>;
      case "accepted":
      case "hired": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Hired</span>;
      case "rejected": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{status || 'Applied'}</span>;
    }
  };

  const getFilteredApplicants = (jobId) => {
    let apps = applicantsByJob[jobId] || [];
    
    if (searchFilters.keyword) {
      const kw = searchFilters.keyword.toLowerCase();
      apps = apps.filter(a => a.user?.name?.toLowerCase().includes(kw) || a.user?.email?.toLowerCase().includes(kw));
    }
    if (searchFilters.status) {
      apps = apps.filter(a => a.status === searchFilters.status);
    }
    if (searchFilters.skills) {
      const sk = searchFilters.skills.toLowerCase();
      apps = apps.filter(a => (a.user?.skills || []).some(s => s.toLowerCase().includes(sk)));
    }
    if (searchFilters.experience) {
      const exp = searchFilters.experience.toLowerCase();
      apps = apps.filter(a => a.user?.experience?.toLowerCase().includes(exp));
    }
    return apps;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row overflow-hidden">
            <div className="flex-1"><StatCard icon={FileText} value={jobs.length} label="Total Jobs" /></div>
            <div className="flex-1"><StatCard icon={CheckCircle2} value={activeJobs} label="Active Jobs" /></div>
            <div className="flex-1"><StatCard icon={Users} value={totalApplicants} label="Applicants" /></div>
            <div className="flex-1 border-b-0"><StatCard icon={Calendar} value={scheduledInterviews.length} label="Interviews" /></div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-lg max-w-fit border border-gray-200">
            <button type="button" onClick={() => setActiveTab("jobs")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "jobs" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black ring-opacity-5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"}`}>
              <FileText className="h-4 w-4" /> My Jobs
            </button>
            <button type="button" onClick={() => setActiveTab("interviews")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "interviews" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black ring-opacity-5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"}`}>
              <Calendar className="h-4 w-4" /> Interviews
            </button>
            <button type="button" onClick={() => setActiveTab("create")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "create" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black ring-opacity-5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"}`}>
              <Plus className="h-4 w-4" /> Create Job
            </button>
          </div>
        </div>

        {activeTab === "jobs" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Job Postings</h2>
              <button type="button" onClick={() => setActiveTab("create")} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
                <Plus className="h-4 w-4" /> New Job
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {jobs.length ? (
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job._id} className="p-6 hover:bg-gray-50 transition duration-150">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${job.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {job.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location || "Location not set"}</span>
                            <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{job.type || "Full-time"}</span>
                            <span className="font-medium text-gray-700">{job.salary || job.experienceRequired || "Open Salary"}</span>
                            <span>&bull;</span>
                            <span className="font-medium text-indigo-600">{(applicantsByJob[job._id] || []).length} Applicants</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleViewJob(job)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm">
                            Manage Job
                          </button>
                          
                          <div ref={(node) => { menuRefs.current[job._id] = node; }} className="relative">
                            <button type="button" onClick={() => setOpenMenuId((current) => (current === job._id ? "" : job._id))} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {openMenuId === job._id ? (
                              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                                <button type="button" onClick={() => startEdit(job)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <PencilLine className="h-4 w-4" /> Edit Job
                                </button>
                                <button type="button" onClick={() => handleJobStatus(job, !job.isActive)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Power className="h-4 w-4" /> {job.isActive ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center text-gray-500 text-sm">No jobs posted yet.</div>
              )}
            </div>

            <div ref={detailsRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8 mt-6">
              {selectedJob ? (
                <div>
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                      <p className="text-base text-gray-600 mt-1">{selectedJob.company} &mdash; {selectedJob.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(selectedJob)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition">
                        Edit Job
                      </button>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-200 mb-6 space-x-6">
                    <button onClick={() => setDetailsTab("info")} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${detailsTab === "info" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      Job Info
                    </button>
                    <button onClick={() => setDetailsTab("applicants")} className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === "applicants" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      Applicants <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{(applicantsByJob[selectedJob._id] || []).length}</span>
                    </button>
                  </div>

                  {detailsTab === "info" ? (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                          <p className="text-sm font-medium text-gray-900">{selectedJob.isActive ? "Active" : "Inactive"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</p>
                          <p className="text-sm font-medium text-gray-900">{selectedJob.type || "Full-time"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Salary</p>
                          <p className="text-sm font-medium text-gray-900">{selectedJob.salary || "Open"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Posted</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(selectedJob.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                          {selectedJob.description || "No description provided."}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedJob.skillsRequired || []).length ? selectedJob.skillsRequired.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium border border-indigo-100">{skill}</span>
                          )) : <span className="text-sm text-gray-500">None specified</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in">
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                          <Filter className="h-4 w-4" /> Filter Candidates
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input placeholder="Name or Email..." className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" value={searchFilters.keyword} onChange={(e) => setSearchFilters({...searchFilters, keyword: e.target.value})} />
                          </div>
                          <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" value={searchFilters.status} onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}>
                            <option value="">All Statuses</option>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <input placeholder="Filter by Skills..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" value={searchFilters.skills} onChange={(e) => setSearchFilters({...searchFilters, skills: e.target.value})} />
                          <input placeholder="Filter by Experience..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none" value={searchFilters.experience} onChange={(e) => setSearchFilters({...searchFilters, experience: e.target.value})} />
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        {getFilteredApplicants(selectedJob._id).length ? (
                          <ul className="divide-y divide-gray-200 bg-white">
                            {getFilteredApplicants(selectedJob._id).map((application) => (
                              <li key={application._id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                      {application.user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        {application.user?.name || "Candidate Name"}
                                        {getStatusBadge(application.status)}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-0.5">{application.user?.email} • Applied {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="relative group">
                                      <button type="button" className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
                                        Update Status
                                      </button>
                                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10 py-1">
                                        {statusOptions.map((status) => (
                                          <button key={status} type="button" onClick={() => handleStatusChange(application._id, status)} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                            Mark as {status}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <button type="button" className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                                      View Profile
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-8 text-center text-gray-500 text-sm bg-white">No candidates match your filters.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  Select "Manage Job" from a posting above to view its details and applicants.
                </div>
              )}
            </div>

            <div ref={editRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8 mt-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Edit Posting</h2>
              </div>
              
              {editingJobId ? (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Job Title</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Salary</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Experience Required</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={form.experienceRequired} onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Skills (Comma separated)</label>
                    <textarea rows="2" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea rows="5" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">Save Changes</button>
                    <button type="button" onClick={cancelEdit} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">Choose "Edit Job" from a posting's menu to make changes.</div>
              )}
            </div>
          </div>
        ) : activeTab === "interviews" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Interviews Schedule</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                {scheduledInterviews.length} Scheduled
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Schedule New Interview</h3>
                  <p className="text-sm text-gray-500 mt-1">Select a shortlisted candidate to arrange a meeting.</p>
                </div>
                {!availableInterviewApplications.length && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">No Shortlisted Candidates</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Candidate</label>
                  <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.applicationId} onChange={(e) => setInterviewForm({ ...interviewForm, applicationId: e.target.value })}>
                    {availableInterviewApplications.length ? availableInterviewApplications.map((app) => (
                      <option key={app._id} value={app._id}>{app.user?.name} ({app.job?.title})</option>
                    )) : <option value="">No available candidates</option>}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <input type="datetime-local" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Meeting Mode</label>
                  <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}>
                    <option>Video Call</option>
                    <option>Phone</option>
                    <option>Onsite</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Link / URL</label>
                  <input type="url" placeholder="e.g. meet.google.com/..." className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Location (If Onsite)</label>
                  <input type="text" placeholder="Office / Floor / Room" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-3">
                  <label className="text-sm font-medium text-gray-700">Interview Notes</label>
                  <textarea rows="2" placeholder="Instructions or preparation notes..." className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" onClick={handleScheduleInterview} disabled={!availableInterviewApplications.length || isSchedulingInterview} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSchedulingInterview ? "Scheduling..." : "Schedule Interview"}
                </button>
              </div>

              {interviewFeedback.text && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${interviewFeedback.type === "error" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  {interviewFeedback.text}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
              {scheduledInterviews.length ? (
                <ul className="divide-y divide-gray-200">
                  {scheduledInterviews.map((interview) => (
                    <li key={interview._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">{interview.user?.name || "Candidate Name"}</h4>
                            <p className="text-sm text-gray-500 mt-0.5">{interview.job?.title || "Role Unspecified"}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-700 mt-2 font-medium">
                              <span className="text-indigo-600">{formatInterviewDate(interview.scheduledAt)}</span>
                              <span>&bull;</span>
                              <span>{formatInterviewTime(interview.scheduledAt)}</span>
                              <span>&bull;</span>
                              <span className="text-gray-500">{interview.mode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {interview.location && <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs font-medium text-gray-700">{interview.location}</span>}
                          {interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                              Join Call
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-gray-300 mb-3" />
                  No upcoming interviews.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "create" ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-10">
              <div className="border-b border-gray-200 pb-5 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create New Job Posting</h2>
                <p className="text-sm text-gray-500 mt-1">Fill out the details below to publish a new open role.</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Job Title <span className="text-rose-500">*</span></label>
                    <input required className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. Senior Backend Engineer" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder={user?.company || "Company Ltd"} value={createForm.company} onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. Remote, San Francisco" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Job Type</label>
                    <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Compensation</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. $100k - $130k" value={createForm.salary} onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Required Skills</label>
                    <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. React, Node.js, MongoDB (comma separated)" value={createForm.skillsRequired} onChange={(e) => setCreateForm({ ...createForm, skillsRequired: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea rows="6" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" placeholder="Detail the role, expectations, and requirements..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  {createMessage && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">{createMessage}</span>}
                  <button type="submit" className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                    Publish Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default ManageJobs;
