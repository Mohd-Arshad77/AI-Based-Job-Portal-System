import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const getHomePath = (user) => {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "recruiter") return "/recruiter/manage";
  return "/dashboard";
};

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");


  const {
    register,
    verifyOtp,
    // loading,
    // isAuthenticated,
    // user: authUser,
  } = useAuth();


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

  const handleSubmit = async (event) => {

    event.preventDefault();
    setMessage("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      // localStorage.removeItem("portal_token");
      // localStorage.removeItem("portal_user");

      // // Set synchronously BEFORE await so the redirect useEffect
      // // never fires while showOTP state is still stale (false)

      setLoading(true);

      const result = await register(form);

      setShowOTP(true);

      console.log(showOTP, "show OTP")

      if (result.success) {
        setVerifyEmail(result.email);
        setMessage(result.message);
      } else {
        setMessage(result?.message || "Registration failed.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP." });
      return;
    }

    setLoading(true);
    const result = await verifyOtp({ email: verifyEmail, otp });
    if (result?.success) {
      navigate("/login");
    } else {
      setMessage(result?.message || "OTP verification failed.");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#F3F5F9] p-4 lg:p-8 font-sans selection:bg-indigo-200 overflow-hidden">
      <div className="relative flex w-full max-w-[800px] h-[520px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] flex-row z-10">
        <div className="hidden relative w-[45%] bg-[#7D66FD] p-10 text-white lg:flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="bg"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-12 w-full mb-4">
            <h2 className="text-2xl font-bold leading-tight mb-3 tracking-wide">
              Looking for your dream job?
            </h2>
            <p className="text-white/80 text-xs leading-relaxed max-w-[90%] font-medium">
              Discover thousands of opportunities and connect with top
              recruiters seamlessly.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7D66FD]/80 to-transparent pointer-events-none"></div>
        </div>

        <div className="hidden lg:block absolute top-0 bottom-0 left-[45%] w-[100px] h-full z-20 pointer-events-none transform -translate-x-[50px]">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M100 0 H50 C120 20 20 60 50 100 H100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative w-full lg:w-[55%] bg-white p-8 lg:px-10 flex flex-col z-10 h-full overflow-hidden">
          <div className="flex-1 flex flex-col justify-center max-w-[300px] mx-auto w-full">
            {!showOTP ? (
              <>
                <div className="mb-4 text-center lg:text-left">
                  <h3 className="text-[#7D66FD] text-md font-medium mb-1 tracking-wide">
                    Hello there!
                  </h3>
                  <h1 className="text-[#7D66FD] text-xl font-semibold">
                    Create Account
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Full Name"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-2">
                    <Mail className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Email Address"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-2">
                    <Lock className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Password"
                      className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none focus:border-[#7D66FD] transition-colors"
                    />
                    {errors.password && (
                      <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {message && (
                    <p
                      className={`text-[11px] font-medium pt-1 ${message.includes("successfully") || message.includes("OTP") ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {message}
                    </p>
                  )}

                  <div className="pt-3">
                    <button
                      disabled={loading}
                      className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 hover:bg-[#6850E2] transition-colors disabled:opacity-70"
                    >
                      {loading ? "Signing up..." : "Sign up"}
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex items-center justify-between text-[11px] font-medium w-full">
                  <p className="text-slate-400">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#7D66FD] hover:underline font-bold"
                    >
                      Sign in
                    </Link>
                  </p>
                  <Link to="#" className="text-[#7D66FD] hover:underline">
                    Terms
                  </Link>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-5 text-center">
                  <h1 className="text-[#7D66FD] text-xl font-semibold mb-2">
                    Verify Email
                  </h1>
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit code sent to <br />
                    <span className="font-medium text-slate-800">
                      {verifyEmail}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="0 0 0 0 0 0"
                      className="w-full border-b py-3 text-center text-2xl tracking-[0.5em] text-[#7D66FD] font-bold outline-none focus:border-[#7D66FD] transition-colors"
                    />
                    {errors.otp && (
                      <p className="mt-2 text-[10px] text-red-500 text-center font-medium">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  {message && (
                    <p
                      className={`text-[11px] font-medium text-center ${message.includes("sent") ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {message}
                    </p>
                  )}

                  <button
                    disabled={loading}
                    className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 hover:bg-[#6850E2] transition-colors disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify Account"}
                  </button>

                  <div className="text-center mt-3">
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
