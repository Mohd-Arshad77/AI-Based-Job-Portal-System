import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2,
  EyeOff, Eye
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await register(form);

    if (result.success) {
      setMessage("Account created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#E5E7EB] items-center justify-center p-4 selection:bg-blue-200">
      <div className="flex h-[90vh] max-h-[700px] w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="w-full lg:w-[55%] flex flex-col px-8 sm:px-12 md:px-16 py-6 relative z-10 bg-white">
          <div className="flex items-center justify-between w-full mb-6">
            <button onClick={() => navigate(-1)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            <p className="text-xs font-medium text-slate-500">
              Already member? <Link to="/login" className="text-[#4C6FFF] font-bold hover:underline">Sign in</Link>
            </p>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Sign Up</h1>
            <p className="text-xs text-slate-400 font-medium">Secure Your Career Journey</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-full w-max mb-6">
            <div className="px-5 py-1.5 rounded-full text-xs font-semibold bg-white text-[#4C6FFF] shadow-sm">
              Job Seeker
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-sm flex-1 flex flex-col justify-center gap-5">
            <div className="relative flex items-center border-b border-slate-200 py-2 group focus-within:border-[#4C6FFF] transition-colors">
              <User className="h-4 w-4 text-slate-400 mr-3" />
              <input
                required
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"
              />
              {form.name.length > 2 && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-2" />}
            </div>

            <div className="relative flex items-center border-b border-slate-200 py-2 group focus-within:border-[#4C6FFF] transition-colors">
              <Mail className="h-4 w-4 text-slate-400 mr-3" />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"
              />
              {form.email.includes("@") && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-2" />}
            </div>

            <div className="relative flex items-center border-b border-slate-200 py-2 group focus-within:border-[#4C6FFF] transition-colors">
              <Lock className="h-4 w-4 text-slate-400 mr-3" />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent outline-none text-base tracking-widest font-medium placeholder:text-slate-400 placeholder:tracking-normal"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Eye className="h-4 w-4 text-slate-400 ml-2" /> : <EyeOff className="h-4 w-4 text-slate-400 ml-2" />}
              </button>
            </div>

            {message && <p className="text-xs font-semibold text-emerald-600">{message}</p>}

            <div className="pt-4 mt-auto mb-4">
              <button
                disabled={loading}
                className="flex items-center justify-between bg-[#4C6FFF] hover:bg-[#3D5CFF] text-white rounded-full py-2.5 px-5 pr-1.5 w-full transition-all disabled:opacity-70 shadow-lg shadow-blue-500/30"
              >
                <span className="font-semibold text-sm pl-2 mx-auto">{loading ? "Please Wait..." : "Create Account"}</span>
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block w-[45%] bg-[#4C6FFF] relative overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 500 800"
          >
            <path d="M0,0 H320 C180,100 120,280 0,250 Z" fill="#2B409B" />
            <path d="M500,200 C250,250 250,600 500,650 Z" fill="#6985FF" />
            <path d="M0,500 C200,550 300,850 500,720 V800 H0 Z" fill="#2B409B" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Register;
