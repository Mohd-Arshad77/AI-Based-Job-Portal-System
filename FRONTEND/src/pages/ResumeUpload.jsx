import { useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { profileApi } from "../services/portalService.js";
import { parsedResumeDemo } from "../data/demoData.js";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(parsedResumeDemo);
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
      setParsed(parsedResumeDemo);
      setMessage(error.response?.data?.message || "Backend unavailable. Showing polished demo parsing output.");
    }
  };

  return (
    <Layout title="Resume Upload" subtitle="Upload a PDF resume, extract skills, and populate your parsed profile with AI-ready signals.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Upload Resume" description="The parser uses keyword matching against predefined skill keywords.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="file" accept="application/pdf" className="w-full rounded-[1.8rem] border border-dashed border-white/20 bg-slate-950/24 px-4 py-8 text-sm text-slate-300" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="rounded-[1.5rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-4 py-3 font-semibold text-slate-950">Upload and Parse</button>
          </form>
          {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        </SectionCard>
        <SectionCard title="Parsed Output" description="Skills, projects, and experience extracted from resume text.">
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="mb-2 text-white">Summary</p>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/24 p-4">{parsed?.summary}</div>
            </div>
            <div>
              <p className="mb-2 text-white">Skills</p>
              <div className="flex flex-wrap gap-2">
                {(parsed?.skills || []).map((skill) => <span key={skill} className="rounded-full bg-cyan-300/12 px-3 py-1 text-cyan-100">{skill}</span>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-white">Projects</p>
              <ul className="space-y-2">
                {(parsed?.projects || []).map((project) => <li key={project} className="rounded-[1.5rem] border border-white/10 bg-slate-950/24 p-3">{project}</li>)}
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
}

export default ResumeUpload;
