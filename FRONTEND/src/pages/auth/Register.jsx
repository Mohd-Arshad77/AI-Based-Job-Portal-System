import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext.jsx";

const getHomePath = (user) => {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "recruiter") return "/recruiter/manage";
  return "/dashboard";
};

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const { register, verifyOtp, loginWithGoogle } = useAuth();

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";
    else if (form.password.length < 6)
      nextErrors.password = "Min 6 characters.";
    return nextErrors;
  };

  // ================= REGISTER =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);

    const result = await register(form);

    if (result?.requiresOTP) {
      setVerifyEmail(result.email);
      setShowOTP(true);
      setMessage(result.message);
    } else {
      setMessage(result?.message || "Registration failed.");
    }

    setLoading(false);
  };

  // ================= VERIFY OTP =================
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (otp.length !== 6) {
      setErrors({ otp: "Enter valid 6-digit OTP" });
      return;
    }

    setLoading(true);

    const result = await verifyOtp({ email: verifyEmail, otp });

    if (!result?.success) {
      setMessage(result?.message || "Invalid OTP");
      setLoading(false);
      return;
    }

    const path =
      result.user?.role === "admin"
        ? "/admin"
        : result.user?.role === "recruiter"
          ? "/recruiter/manage"
          : "/dashboard";

    navigate(path);

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");

    if (!credentialResponse.credential) {
      setMessage("Google did not return a credential. Please try again.");
      return;
    }

    setLoading(true);
    const result = await loginWithGoogle(credentialResponse.credential);

    if (result?.success) {
      navigate(getHomePath(result.user), { replace: true });
    } else {
      setMessage(result?.message || "Google auth failed");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#F3F5F9] p-4 font-sans selection:bg-indigo-200 lg:p-8">
      <div className="relative z-10 flex h-[520px] w-full max-w-[800px] flex-row overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]">
        <div className="relative hidden w-[45%] flex-col justify-center overflow-hidden bg-[#7D66FD] p-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Career workspace"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 mb-4 w-full">
            <h2 className="mb-3 text-2xl font-bold leading-tight tracking-wide">
              Looking for your dream job?
            </h2>
            <p className="max-w-[90%] text-xs font-medium leading-relaxed text-white/80">
              Discover thousands of opportunities and connect with top recruiters seamlessly.
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7D66FD]/80 to-transparent"></div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-[45%] top-0 z-20 hidden h-full w-[100px] -translate-x-[50px] lg:block">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100 0 H50 C120 20 20 60 50 100 H100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-white p-8 lg:w-[55%] lg:px-10">
          <div className="mx-auto flex w-full max-w-[300px] flex-1 flex-col justify-center">
            {!showOTP ? (
              <>
                <div className="mb-4 text-center lg:text-left">
                  <h3 className="mb-1 text-md font-medium tracking-wide text-[#7D66FD]">Hello there!</h3>
                  <h1 className="text-xl font-semibold text-[#7D66FD]">Create Account</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7D66FD]"
                    />
                    {errors.name && <p className="absolute -bottom-4 text-[10px] font-medium text-red-500">{errors.name}</p>}
                  </div>

                  <div className="relative mt-2">
                    <Mail className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7D66FD]"
                    />
                    {errors.email && <p className="absolute -bottom-4 text-[10px] font-medium text-red-500">{errors.email}</p>}
                  </div>

                  <div className="relative mt-2">
                    <Lock className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7D66FD]"
                    />
                    {errors.password && <p className="absolute -bottom-4 text-[10px] font-medium text-red-500">{errors.password}</p>}
                  </div>

                  {message && <p className="pt-1 text-[11px] font-medium text-red-500">{message}</p>}

                  <div className="pt-3">
                    <button
                      disabled={loading}
                      className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 transition-colors hover:bg-[#6850E2] disabled:opacity-70"
                    >
                      {loading ? "Signing up..." : "Sign up"}
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-wider">
                      <span className="bg-white px-2 text-slate-400">Or continue with</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setMessage("Google signup failed. Please try again.")}
                      text="signup_with"
                      width="280"
                    />
                  </div>
                </div>

                <div className="mt-4 flex w-full items-center justify-between text-[11px] font-medium">
                  <p className="text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-[#7D66FD] hover:underline">Sign in</Link>
                  </p>
                  <Link to="#" className="text-[#7D66FD] hover:underline">Terms</Link>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-5 text-center">
                  <h1 className="mb-2 text-xl font-semibold text-[#7D66FD]">Verify Email</h1>
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit code sent to <br />
                    <span className="font-medium text-slate-800">{verifyEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="0 0 0 0 0 0"
                      className="w-full border-b py-3 text-center text-2xl font-bold tracking-[0.5em] text-[#7D66FD] outline-none transition-colors focus:border-[#7D66FD]"
                    />
                    {errors.otp && <p className="mt-2 text-center text-[10px] font-medium text-red-500">{errors.otp}</p>}
                  </div>

                  {message && <p className="text-center text-[11px] font-medium text-red-500">{message}</p>}

                  <button
                    disabled={loading}
                    className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 transition-colors hover:bg-[#6850E2] disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify Account"}
                  </button>

                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowOTP(false)}
                      className="text-[11px] font-medium text-slate-400 hover:text-[#7D66FD] hover:underline"
                    >
                      Change Email Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
