import { useState, useRef } from "react";
import Layout from "../../components/Layout.jsx";
import { User, Mail, Phone, Briefcase, GraduationCap, Code, MapPin, Upload, X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx"; // Check if this path is correct
function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "", // Added location
    education: user?.education || "",
    experience: user?.experience || "", // This will now be a smaller field
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(user?.skills || ["React", "Node.js"]);
  const [resume, setResume] = useState(null);

  // Skill tag logic
  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const labelStyle = "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2";
  const inputStyle = "w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5";

  return (
    <Layout title="Profile Settings">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 p-4">
        
        {/* Left Sidebar: Minimalist Identity */}
        <div className="lg:w-1/3 space-y-6">
          <div className="rounded-[32px] bg-white border border-slate-100 p-8 text-center shadow-sm">
            <div className="relative mx-auto w-24 h-24 mb-4">
               <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <User size={40} />
               </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{form.name || "Full Name"}</h2>
            <p className="text-sm text-slate-400 mb-6">{user?.email}</p>
            
            {/* Minimal Resume Upload */}
            <div className="group relative rounded-2xl border-2 border-dashed border-slate-100 p-4 transition-all hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer">
              <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 mb-2" size={20} />
              <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">
                {resume ? resume.name : "Replace Resume"}
              </span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setResume(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Right Content: The Form */}
        <div className="lg:w-2/3 space-y-6">
          <div className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Row 1 */}
              <div>
                <label className={labelStyle}><User size={14} /> Full Name</label>
                <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}><Mail size={14} /> Email (Verified)</label>
                <input className={`${inputStyle} opacity-60 cursor-not-allowed`} value={user?.email} disabled />
              </div>

              {/* Row 2 */}
              <div>
                <label className={labelStyle}><Phone size={14} /> Phone</label>
                <input className={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}><MapPin size={14} /> Location</label>
                <input className={inputStyle} placeholder="e.g. Kozhikode, Kerala" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>

              {/* Row 3 - Education and Experience (Small Box) */}
              <div>
                <label className={labelStyle}><GraduationCap size={14} /> Education</label>
                <input className={inputStyle} placeholder="BCA / B.Tech" value={form.education} onChange={e => setForm({...form, education: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}><Briefcase size={14} /> Years of Experience</label>
                <input className={inputStyle} type="number" placeholder="e.g. 2" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} />
              </div>

              {/* Row 4 - Interactive Skills */}
              <div className="md:col-span-2">
                <label className={labelStyle}><Code size={14} /> Skills & Technologies</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-blue-800"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <input 
                  className={inputStyle} 
                  placeholder="Type skill and press Enter..." 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95">
                <Check size={18} /> Update Profile
              </button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Profile;