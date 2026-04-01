import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { applicationsApi } from "../services/portalService.js";
import { demoApplications } from "../data/demoData.js";

function Applications() {
  const [applications, setApplications] = useState(demoApplications);

  useEffect(() => {
    applicationsApi.list().then(({ data }) => setApplications(data)).catch(() => setApplications(demoApplications));
  }, []);

  return (
    <Layout title="Applications" subtitle="Monitor your applications and track each status update from one clean workspace.">
      <SectionCard title="My Applications">
        <div className="space-y-3">
          {applications.map((application) => (
            <div key={application._id} className="rounded-[1.8rem] border border-white/10 bg-slate-950/24 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{application.job.title}</p>
                  <p className="text-sm text-slate-400">{application.job.company} • Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={application.status} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </Layout>
  );
}

export default Applications;
