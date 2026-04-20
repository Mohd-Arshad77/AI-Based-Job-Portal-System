import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

const initialForm = { email: "", password: "" };

const getHomePath = (user) => {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "recruiter") return "/recruiter/manage";
  return "/dashboard";
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

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

    const from = location.state?.from?.pathname || "/dashboard";
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
              Looking for your dream job?
            </h2>
            <p className="text-white/80 text-xs leading-relaxed max-w-[90%] font-medium">
              Discover thousands of opportunities and connect with top recruiters seamlessly.
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
          <div className="flex-1 flex flex-col justify-center max-w-[300px] mx-auto w-full">
            
            <div className="mb-4 text-center lg:text-left">
              <h3 className="text-[#7D66FD] text-md font-medium mb-1 tracking-wide">Hello there!</h3>
              <h1 className="text-[#7D66FD] text-xl font-semibold">Welcome Back</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address"
                  className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                />
                {errors.email && <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">{errors.email}</p>}
              </div>

              <div className="relative mt-2">
                <Lock className="absolute left-0 top-2.5 h-4 w-4 text-[#7D66FD]" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
                  className="w-full border-b border-indigo-100 py-2 pl-7 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#7D66FD] transition-colors"
                />
                {errors.password && <p className="text-[10px] text-red-500 font-medium absolute -bottom-4">{errors.password}</p>}
              </div>

              {message && <p className="text-[11px] text-red-500 font-medium pt-1">{message}</p>}

              <div className="pt-3">
                <button
                  disabled={loading}
                  className="w-full rounded-md bg-[#7D66FD] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7D66FD]/30 hover:bg-[#6850E2] transition-colors disabled:opacity-70"
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
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                  <span className="bg-white px-2 text-slate-400">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center transform scale-90">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage("Google Login Failed.")}
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-medium w-full">
              <p className="text-slate-400">
                Don't have an account? <Link to="/register" className="text-[#7D66FD] hover:underline font-bold">Register</Link>
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