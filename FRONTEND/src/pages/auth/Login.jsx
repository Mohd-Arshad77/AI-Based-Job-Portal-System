import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const initialForm = { email: "", password: "" };

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loading, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "recruiter") navigate("/recruiter/manage");
      else navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);
  console.log("My Client ID is:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const redirectAfterAuth = (userData) => {
    const actualUser = userData?.role ? userData : userData?.user;
    const role = actualUser?.role?.toLowerCase();

    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    if (role === "recruiter") {
      navigate("/recruiter/manage", { replace: true });
      return;
    }

    if (role === "user") {
      navigate("/dashboard", { replace: true });
      return;
    }

    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await login(form);

    if (result.success) {
      redirectAfterAuth(result.user);
    } else {
      setMessage(result.message);
      toast.error(result.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");

    if (!credentialResponse.credential) {
      setMessage("Google did not return a credential. Please try again.");
      return;
    }

    const result = await loginWithGoogle(credentialResponse.credential);

    if (result.success) {
      redirectAfterAuth(result.user);
    } else {
      setMessage(result.message);
      toast.error(result.message);
    }
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
            <div className="mb-4 text-center lg:text-left">
              <h3 className="mb-1 text-md font-medium tracking-wide text-[#7D66FD]">Hello there!</h3>
              <h1 className="text-xl font-semibold text-[#7D66FD]">Welcome Back</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address"
                  className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7D66FD]"
                />
                {errors.email && <p className="absolute -bottom-4 text-[10px] font-medium text-red-500">{errors.email}</p>}
              </div>

              <div className="relative mt-2">
                <Lock className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
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
                  {loading ? "Signing in..." : "Sign in"}
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
                  onError={() => setMessage("Google login failed. Please try again.")}
                  text="signin_with"
                  width="280"
                />
              </div>
            </div>

            <div className="mt-4 flex w-full items-center justify-between text-[11px] font-medium">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-[#7D66FD] hover:underline">Register</Link>
              </p>
              <Link to="#" className="text-[#7D66FD] hover:underline">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
