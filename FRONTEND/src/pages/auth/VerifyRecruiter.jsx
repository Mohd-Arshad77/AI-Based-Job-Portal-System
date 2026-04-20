import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { recruiterApi } from "../../services/api.js";

function VerifyRecruiter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: defaultEmail,
    code: "",
    password: "" 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.code.length !== 6) {
      return setError("Verification code must be 6 digits.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await recruiterApi.verifyAccount({
        email: form.email,
        verificationCode: form.code,
        newPassword: form.password
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#F3F5F9] p-4 lg:p-8 font-sans selection:bg-indigo-200 overflow-hidden">
      
      <div className="relative flex w-full max-w-[800px] h-[520px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] flex-row z-10">

      
        <div className="hidden relative w-[45%] bg-[#7D66FD] p-10 text-white lg:flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="bg" className="h-full w-full object-cover" />
          </div>
          <div className="relative z-10 w-full mb-4">
            <h2 className="text-2xl font-bold leading-tight mb-3 tracking-wide">
              Welcome to the Team!
            </h2>
            <p className="text-white/80 text-xs leading-relaxed max-w-[90%] font-medium">
              Activate your recruiter account to start finding top talent and managing job postings efficiently.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7D66FD]/80 to-transparent pointer-events-none"></div>
        </div>

        <div className="hidden lg:block absolute top-0 bottom-0 left-[45%] w-[100px] h-full z-20 pointer-events-none transform -translate-x-[50px]">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M100 0 H50 C120 20 20 60 50 100 H100 Z" fill="white" />
           </svg>
        </div>

        <div className="relative w-full lg:w-[55%] bg-white p-8 lg:px-10 flex flex-col z-10 h-full overflow-hidden">
          <div className="flex-1 flex flex-col justify-center max-w-[320px] mx-auto w-full">
            
            {success ? (
             
              <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Account Verified!</h3>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  Your recruiter account is now active. <br/> Redirecting to login...
                </p>
              </div>
            ) : (
            
              <>
                <div className="mb-6 text-center lg:text-left">
                  <h3 className="text-[#7D66FD] text-md font-medium mb-1 tracking-wide">Recruiter Portal</h3>
                  <h1 className="text-[#7D66FD] text-xl font-semibold">Verify Account</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="relative">
                    <Mail className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
                      placeholder="6-Digit Verification Code"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm font-semibold tracking-widest text-[#7D66FD] placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Set Password"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-500 font-medium text-center pt-1">{error}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 hover:bg-[#6850E2] transition-colors disabled:opacity-70"
                    >
                      {loading ? "Verifying..." : "Activate Account"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-center text-[11px] font-medium w-full">
                  <p className="text-slate-400">
                    Already verified? <Link to="/login" className="text-[#7D66FD] hover:underline font-bold">Sign in</Link>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyRecruiter;