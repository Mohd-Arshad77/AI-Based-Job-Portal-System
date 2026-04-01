import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { applicationsApi } from "../services/portalService.js";
import { demoApplications } from "../data/demoData.js";

const statusOptions = ["Pending", "Shortlisted", "Rejected", "Hired"];

function Applicants() {
  const [applications, setApplications] = useState(demoApplications);
  const [message, setMessage] = useState("");

  useEffect(() => {
    applicationsApi.list().then(({ data }) => setApplications(data)).catch(() => setApplications(demoApplications));
  }, []);

  const groupedApplications = useMemo(() => applications.reduce((groups, application) => {
    const key = application.job.title;
    groups[key] = groups[key] || [];
    groups[key].push(application);
    return groups;
  }, {}), [applications]);

  const handleStatus = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, status);
      setApplications((current) => current.map((item) => (item._id === id ? { ...item, status } : item)));
      setMessage(`Status updated to ${status}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Backend unavailable. Changes are not persisted in demo mode.");
    }
  };

  return (
    <Layout title="Applicants" subtitle="Review candidates for your jobs and update application status from one recruiter workspace.">
      <SectionCard title="Applicant List">
        <div className="space-y-6">
          {Object.entries(groupedApplications).map(([jobTitle, jobApplications]) => (
            <div key={jobTitle} className="space-y-3">
              <h3 className="text-lg font-semibold text-white">{jobTitle}</h3>
              {jobApplications.map((application) => (
                <div key={application._id} className="rounded-[1.8rem] border border-white/10 bg-slate-950/24 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{application.user.name}</p>
                      <p className="text-sm text-slate-400">{application.user.email}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button key={status} onClick={() => handleStatus(application._id, status)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/10">{status}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      </SectionCard>
    </Layout>
  );
}

export default Applicants;
