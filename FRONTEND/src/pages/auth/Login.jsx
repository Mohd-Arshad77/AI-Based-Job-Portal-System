import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const initialForm = { email: "recruiter@test.com", password: "123456" };

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await login(form);
    if (result.success) {
      if (!result.demo) {
        setMessage("Login successful.");
      }
      navigate(result.user?.role === "recruiter" ? "/recruiter/manage" : "/dashboard");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#F3F5F9] p-4 lg:p-8 font-sans selection:bg-indigo-200 overflow-hidden">

      <div className="relative flex w-full max-w-[900px] h-[550px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] flex-row z-10">
        
        {/* Left Side (Purple) */}
        <div className="hidden relative w-[45%] bg-[#7D66FD] p-12 text-white lg:flex flex-col justify-center overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="bg" className="h-full w-full object-cover" />
            </div>
            
            <div className="relative z-10 w-full">
               <h2 className="text-[2.2rem] font-bold leading-tight mb-4 tracking-wide">
                 Looking for your dream job?
               </h2>
               <p className="text-white/80 text-sm leading-relaxed max-w-[85%] font-medium">
                 Discover thousands of opportunities and connect with top recruiters seamlessly using our AI-driven platform.
               </p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#7D66FD]/80 to-transparent pointer-events-none"></div>
        </div>

        {/* The White Curve separator */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-[45%] w-[120px] h-full z-20 pointer-events-none transform -translate-x-[60px]">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M100 0 H50 C120 20 20 60 50 100 H100 Z" fill="white" />
           </svg>
        </div>

        {/* Right Side (Form) */}
        <div className="relative w-full lg:w-[55%] bg-white p-8 lg:px-12 lg:py-8 flex flex-col z-10 h-full overflow-hidden">
           
           <div className="flex-1 flex flex-col justify-center max-w-[320px] mx-auto w-full">
             <div className="mb-8 text-center lg:text-left">
               <h3 className="text-[#7D66FD] text-lg lg:text-xl font-medium mb-1 tracking-wide">Hello there!</h3>
               <h1 className="text-[#7D66FD] text-2xl lg:text-3xl font-semibold">Welcome Back</h1>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <User className="absolute left-0 top-3 h-4 w-4 text-[#7D66FD]" />
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="Email Address" 
                    className="w-full border-b border-indigo-100 py-3 pl-8 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">{errors.email}</p>}
                </div>
                
                <div className="relative mt-2">
                  <Lock className="absolute left-0 top-3 h-4 w-4 text-[#7D66FD]" />
                  <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    placeholder="Password" 
                    className="w-full border-b border-indigo-100 py-3 pl-8 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                  />
                  {errors.password && <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">{errors.password}</p>}
                </div>

                {message && <p className="text-xs text-red-500 font-medium pt-2">{message}</p>}

                <div className="pt-8">
                  <button 
                    disabled={loading}
                    className="w-full rounded-md bg-[#7D66FD] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 hover:bg-[#6850E2] transition-colors disabled:opacity-70"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
             </form>
             
             <div className="mt-14 flex items-center justify-between text-[11px] font-medium w-full">
               <p className="text-slate-400">
                 Don't have an account? <Link to="/register" className="text-[#7D66FD] hover:underline font-bold">Register</Link>
               </p>
               <Link to="#" className="text-[#7D66FD] hover:underline">Terms & Conditions</Link>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
