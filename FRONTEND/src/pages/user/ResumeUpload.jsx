import { useState } from "react";
import Layout from "../../components/Layout.jsx";
import { profileApi } from "../../services/api.js";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Select a PDF resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      await profileApi.uploadResume(formData);
      const { data } = await profileApi.parseResume(formData);
      setParsed(data.parsedData);
      setMessage("Resume uploaded and parsed successfully.");
    } catch (error) {
      setParsed(null);
      setMessage(error.response?.data?.message || "Could not parse resume.");
    }
  };

  return (
    <Layout title="Resume Upload" subtitle="Upload your resume and extract skills using the existing parser.">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="file" accept="application/pdf" className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Upload and Parse</button>
          </form>
          {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Parsed Result</h2>
          {parsed ? (
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="mb-2 text-slate-950">Summary</p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">{parsed.summary}</div>
              </div>
              <div>
                <p className="mb-2 text-slate-950">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(parsed.skills || []).map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{skill}</span>)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-slate-950">Projects</p>
                <ul className="space-y-2">
                  {(parsed.projects || []).map((project) => <li key={project} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">{project}</li>)}
                </ul>
              </div>
            </div>
          ) : <p className="mt-4 text-sm text-slate-500">No parsed data yet.</p>}
        </div>
      </div>
    </Layout>
  );
}

export default ResumeUpload;
