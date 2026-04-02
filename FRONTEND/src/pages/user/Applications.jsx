import { useEffect, useState } from "react";
import Layout from "../../components/Layout.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { applicationsApi } from "../../services/api.js";

function Applications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    applicationsApi.list().then(({ data }) => setApplications(data)).catch(() => setApplications([]));
  }, []);

  return (
    <Layout title="Applications" subtitle="Track the status of the jobs you have applied for.">
      <div className="space-y-4">
        {applications.length ? applications.map((application) => (
          <div key={application._id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">{application.job.title}</p>
                <p className="mt-1 text-sm text-slate-500">{application.job.company} • Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">No applications found.</p>}
      </div>
    </Layout>
  );
}

export default Applications;
