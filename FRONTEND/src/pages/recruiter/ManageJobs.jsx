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
  Users
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

function StatCard({ icon: Icon, value, label, tint }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${tint}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-base text-slate-500">{label}</p>
        </div>
      </div>
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
  const [editingJobId, setEditingJobId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [interviewForm, setInterviewForm] = useState(initialInterviewForm);
  const [createMessage, setCreateMessage] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState({ type: "", text: "" });
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
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
      setInterviewFeedback({
        type: "error",
        text: error.response?.data?.message || "Could not load interviews."
      });
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
    if (!openMenuId) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      const activeMenu = menuRefs.current[openMenuId];
      if (activeMenu && !activeMenu.contains(event.target)) {
        setOpenMenuId("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    interviews
      .map((interview) => interview.application?._id || interview.application)
      .filter(Boolean)
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
      setInterviewForm((current) => (
        current.applicationId ? { ...current, applicationId: "" } : current
      ));
      return;
    }

    const hasSelectedApplication = availableInterviewApplications.some(
      (application) => application._id === interviewForm.applicationId
    );

    if (!hasSelectedApplication) {
      setInterviewForm((current) => ({
        ...current,
        applicationId: availableInterviewApplications[0]._id
      }));
    }
  }, [availableInterviewApplications, interviewForm.applicationId]);

  const scrollToSection = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleViewJob = (job) => {
    setSelectedJobId(job._id);
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
      setMessage(`Status updated to ${status}.`);
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
    if (!interviewForm.applicationId) {
      setInterviewFeedback({ type: "error", text: "Please select an applicant." });
      return;
    }

    if (!interviewForm.scheduledAt) {
      setInterviewFeedback({ type: "error", text: "Please choose an interview date and time." });
      return;
    }

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

      setInterviewFeedback({
        type: "success",
        text: data.message || "Interview scheduled successfully."
      });

      await fetchInterviews();
      const { data: applicationsData } = await applicationsApi.list();
      setApplications(applicationsData);
      setInterviewForm((current) => ({
        ...initialInterviewForm,
        mode: current.mode
      }));
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      setInterviewFeedback({
        type: "error",
        text: error.response?.data?.message || "Could not schedule interview."
      });
    } finally {
      setIsSchedulingInterview(false);
    }
  };

  const formatInterviewDate = (value) => {
    if (!value) {
      return "Date not set";
    }

    return new Date(value).toLocaleDateString();
  };

  const formatInterviewTime = (value) => {
    if (!value) {
      return "Time not set";
    }

    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
      case "pending":
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">new</span>;
      case "interview":
      case "shortlisted":
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">interview</span>;
      case "accepted":
      case "hired":
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">accepted</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{status}</span>;
    }
  };

  return (
    <Layout>
      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <StatCard icon={FileText} value={jobs.length} label="Total Jobs" tint="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} value={activeJobs} label="Active Jobs" tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} value={totalApplicants} label="Applicants" tint="bg-amber-50 text-amber-600" />
        <StatCard icon={Calendar} value={scheduledInterviews.length} label="Interviews" tint="bg-sky-50 text-sky-600" />
      </div>

      <div className="mt-10 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-8">
          <button type="button" onClick={() => setActiveTab("jobs")} className={`flex items-center gap-3 border-b-2 pb-3 text-base transition ${activeTab === "jobs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"}`}>
            <FileText className="h-6 w-6" />
            My Jobs
          </button>
          <button type="button" onClick={() => setActiveTab("applicants")} className={`flex items-center gap-3 border-b-2 pb-3 text-base transition ${activeTab === "applicants" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"}`}>
            <Users className="h-6 w-6" />
            Applicants
          </button>
          <button type="button" onClick={() => setActiveTab("interviews")} className={`flex items-center gap-3 border-b-2 pb-3 text-base transition ${activeTab === "interviews" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"}`}>
            <Calendar className="h-6 w-6" />
            Interviews
          </button>
          <button type="button" onClick={() => setActiveTab("create")} className={`flex items-center gap-3 border-b-2 pb-3 text-base transition ${activeTab === "create" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"}`}>
            <Plus className="h-6 w-6" />
            Create Job
          </button>
        </div>
      </div>

      {activeTab === "jobs" ? (
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">Job Postings</h2>
            <button type="button" onClick={() => setActiveTab("create")} className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700">
              <Plus className="h-6 w-6" />
              New Job
            </button>
          </div>

          {jobs.length ? jobs.map((job) => (
            <div key={job._id} className="group rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-xl font-semibold text-slate-950 transition-colors duration-200 group-hover:text-blue-700 sm:text-2xl">{job.title}</h3>
                    <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${job.isActive ? "bg-emerald-500 text-white" : "bg-rose-100 text-rose-700"}`}>
                      {job.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-5 text-base text-slate-600">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5" />{job.location || "Location not set"}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-5 w-5" />{job.type || "Full-time"}</span>
                    <span>{job.salary || job.experienceRequired || "Open"}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{(applicantsByJob[job._id] || []).length} applicants | Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3 self-start">
                  <button type="button" onClick={() => handleViewJob(job)} className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:border-blue-200 hover:bg-slate-50">
                    <Eye className="h-5 w-5" />
                    View
                  </button>

                  <div ref={(node) => { menuRefs.current[job._id] = node; }} className="relative">
                    <button type="button" onClick={() => setOpenMenuId((current) => (current === job._id ? "" : job._id))} className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:border-blue-200 hover:bg-slate-50 hover:text-slate-900" aria-label={`Open actions for ${job.title}`}>
                      <MoreVertical className="h-6 w-6" />
                    </button>

                    {openMenuId === job._id ? (
                      <div className="absolute right-0 top-full z-20 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        <button type="button" onClick={() => handleViewJob(job)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button type="button" onClick={() => startEdit(job)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600">
                          <PencilLine className="h-4 w-4" />
                          Edit Job
                        </button>
                        <button type="button" onClick={() => handleJobStatus(job, !job.isActive)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600">
                          <Power className="h-4 w-4" />
                          {job.isActive ? "Deactivate Job" : "Activate Job"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )) : <p className="text-base text-slate-500">No jobs found.</p>}

          <div ref={detailsRef} className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Job Details</h2>
            <p className="mt-2 text-base text-slate-500">Use View to inspect a job before editing or changing its status.</p>

            {selectedJob ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-xl font-semibold text-slate-950">{selectedJob.title}</h3>
                      <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${selectedJob.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {selectedJob.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-5 text-base text-slate-600">
                      <span>{selectedJob.company}</span>
                      <span>{selectedJob.location}</span>
                      <span>{selectedJob.type || "Full-time"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => startEdit(selectedJob)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50 hover:text-blue-600">
                      Edit Job
                    </button>
                    <button type="button" onClick={() => handleJobStatus(selectedJob, !selectedJob.isActive)} className={`rounded-2xl px-5 py-3 text-base font-medium text-white transition ${selectedJob.isActive ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
                      {selectedJob.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Applicants</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{(applicantsByJob[selectedJob._id] || []).length}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Posted On</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{new Date(selectedJob.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Compensation</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{selectedJob.salary || selectedJob.experienceRequired || "Open"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Description</p>
                  <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-600">{selectedJob.description || "No description provided."}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Required Skills</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(selectedJob.skillsRequired || []).length ? selectedJob.skillsRequired.map((skill) => (
                      <span key={skill} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">{skill}</span>
                    )) : <span className="text-base text-slate-500">No skills added yet.</span>}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-base text-slate-500">Click View on any job card to see its full details here.</p>
            )}
          </div>

          <div ref={editRef} className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Edit Job</h2>
            <p className="mt-2 text-base text-slate-500">Open the action menu from the three dots and choose Edit Job to update this posting.</p>
            {editingJobId ? (
              <form onSubmit={handleUpdate} className="mt-6 grid gap-5 md:grid-cols-2">
                <input className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none" placeholder="Job title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none" placeholder="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none" placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none" placeholder="Experience Required" value={form.experienceRequired} onChange={(event) => setForm({ ...form, experienceRequired: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none" placeholder="Salary" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} />
                <textarea className="min-h-28 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none md:col-span-2" placeholder="Required skills comma separated" value={form.skillsRequired} onChange={(event) => setForm({ ...form, skillsRequired: event.target.value })} />
                <textarea className="min-h-40 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none md:col-span-2" placeholder="Job description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white hover:bg-blue-700">Save Changes</button>
                  <button type="button" onClick={cancelEdit} className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-medium text-slate-700">Cancel</button>
                </div>
              </form>
            ) : (
              <p className="mt-6 text-base text-slate-500">Choose Edit Job from the action menu to update a posting.</p>
            )}
            {message && activeTab === "jobs" ? <p className="mt-5 text-base text-emerald-600">{message}</p> : null}
          </div>
        </div>
      ) : activeTab === "applicants" ? (
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">All Applicants</h2>
            <input placeholder="Search applicants..." className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-4 text-base text-slate-700 outline-none" />
          </div>

          {applications.length ? applications.map((application) => (
            <div key={application._id} className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-xl font-semibold text-blue-600">
                    {application.user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) || "AP"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">{application.user?.name || "Applicant"}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="mt-3 text-lg text-blue-600">{application.job?.title || "Unknown Job"}</p>
                    <div className="mt-4 flex flex-wrap gap-8 text-base text-slate-600">
                      <span className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {application.user?.email || "No email"}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {application.user?.phone || "+1 234 567 890"}
                      </span>
                    </div>
                    <p className="mt-4 text-base text-slate-500">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="relative group">
                    <button type="button" className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-medium text-slate-700 hover:border-blue-200 hover:bg-slate-50">
                      Update Status
                    </button>
                    <div className="absolute right-0 top-full z-10 hidden w-48 pt-2 group-hover:block">
                      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                        {statusOptions.map((status) => (
                          <button key={status} type="button" onClick={() => handleStatusChange(application._id, status)} className="block w-full rounded-xl px-4 py-3 text-left text-base text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="button" className="rounded-2xl bg-blue-600 px-6 py-4 text-base font-medium text-white hover:bg-blue-700">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )) : <p className="text-base text-slate-500">No applicants found.</p>}
        </div>
      ) : activeTab === "interviews" ? (
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">Scheduled Interviews</h2>
            <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              {scheduledInterviews.length} scheduled
            </span>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Create Interview</h3>
                <p className="mt-2 text-base text-slate-500">Choose a shortlisted applicant and schedule the interview details below.</p>
              </div>
              {!availableInterviewApplications.length ? (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                  No shortlisted applicants available
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="xl:col-span-1">
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Applicant</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                  value={interviewForm.applicationId}
                  onChange={(event) => setInterviewForm({ ...interviewForm, applicationId: event.target.value })}
                >
                  {availableInterviewApplications.length ? availableInterviewApplications.map((application) => (
                    <option key={application._id} value={application._id}>
                      {(application.user?.name || "Applicant")} - {(application.job?.title || "Unknown Job")}
                    </option>
                  )) : <option value="">No shortlisted applicants</option>}
                </select>
              </div>

              <div className="xl:col-span-1">
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                  value={interviewForm.scheduledAt}
                  onChange={(event) => setInterviewForm({ ...interviewForm, scheduledAt: event.target.value })}
                />
              </div>

              <div className="xl:col-span-1">
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Mode</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                  value={interviewForm.mode}
                  onChange={(event) => setInterviewForm({ ...interviewForm, mode: event.target.value })}
                >
                  <option>Video Call</option>
                  <option>Phone</option>
                  <option>Onsite</option>
                </select>
              </div>

              <div className="md:col-span-2 xl:col-span-1">
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                  value={interviewForm.meetingLink}
                  onChange={(event) => setInterviewForm({ ...interviewForm, meetingLink: event.target.value })}
                />
              </div>

              <div className="md:col-span-2 xl:col-span-1">
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Location</label>
                <input
                  type="text"
                  placeholder="Office / City / Venue"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                  value={interviewForm.location}
                  onChange={(event) => setInterviewForm({ ...interviewForm, location: event.target.value })}
                />
              </div>

              <div className="md:col-span-2 xl:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleScheduleInterview}
                  disabled={!availableInterviewApplications.length || isSchedulingInterview}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <Plus className="h-5 w-5" />
                  {isSchedulingInterview ? "Scheduling..." : "Schedule Interview"}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</label>
              <textarea
                placeholder="Add preparation notes or instructions for the candidate"
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none"
                value={interviewForm.notes}
                onChange={(event) => setInterviewForm({ ...interviewForm, notes: event.target.value })}
              />
            </div>
          </div>

          {interviewFeedback.text ? (
            <p className={`text-lg ${interviewFeedback.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
              {interviewFeedback.text}
            </p>
          ) : null}

          {scheduledInterviews.length ? scheduledInterviews.map((interview) => (
            <div key={interview._id} className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{interview.user?.name || "Applicant"}</h3>
                    <p className="mt-2 text-base text-slate-600">{interview.job?.title || "Unknown Role"}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-6 text-base text-slate-600">
                      <span className="font-medium text-slate-900">{formatInterviewDate(interview.scheduledAt)}</span>
                      <span>{formatInterviewTime(interview.scheduledAt)}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{interview.mode || "Not set"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {interview.location ? (
                    <span className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-medium text-slate-700">
                      {interview.location}
                    </span>
                  ) : null}
                  {interview.meetingLink ? (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-blue-600 px-6 py-4 text-base font-medium text-white hover:bg-blue-700"
                    >
                      Join Meeting
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-[30px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Calendar className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-6 text-xl font-semibold text-slate-950">No Interviews Scheduled</h3>
              <p className="mt-3 text-base text-slate-500">Shortlist applicants to schedule interviews.</p>
            </div>
          )}
        </div>
      ) : activeTab === "create" ? (
        <div className="mx-auto mt-12 max-w-5xl">
          <form onSubmit={handleCreateJob} className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Job Title</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. Senior Frontend Developer" value={createForm.title} onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })} />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Company Name</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. Meta, Optional" value={createForm.company} onChange={(event) => setCreateForm({ ...createForm, company: event.target.value })} />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">Location</label>
                <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. San Francisco, CA" value={createForm.location} onChange={(event) => setCreateForm({ ...createForm, location: event.target.value })} />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">Job Type</label>
                <select className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" value={createForm.type} onChange={(event) => setCreateForm({ ...createForm, type: event.target.value })}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Salary</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. $80k - $120k / Competitive" value={createForm.salary} onChange={(event) => setCreateForm({ ...createForm, salary: event.target.value })} />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Job Description</label>
              <textarea className="min-h-52 w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="Describe the role, responsibilities, and requirements..." value={createForm.description} onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })} />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-950">Required Skills (comma separated)</label>
              <input className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-base text-slate-900 shadow-sm outline-none" placeholder="e.g. React, TypeScript, Node.js" value={createForm.skillsRequired} onChange={(event) => setCreateForm({ ...createForm, skillsRequired: event.target.value })} />
            </div>

            <button className="rounded-3xl bg-blue-600 px-8 py-5 text-base font-semibold text-white shadow-sm hover:bg-blue-700">Create Job</button>
            {createMessage ? <p className="pb-8 text-base text-emerald-600">{createMessage}</p> : null}
          </form>
        </div>
      ) : null}
    </Layout>
  );
}

export default ManageJobs;
