import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = { email: "user@demo.com", password: "password123" };

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
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await login(form);
    if (result.success) {
      setMessage(result.demo ? "Signed in with the demo workspace because the backend is offline." : "Login successful.");
      navigate(result.user?.role === "recruiter" ? "/manage-jobs" : "/dashboard");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-indigo-500/28 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-8rem] h-80 w-80 rounded-full bg-cyan-400/18 blur-3xl" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/12 bg-white/10 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-slate-950/24 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-indigo-400 to-violet-500 text-slate-950">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h2 className="mt-8 text-4xl font-semibold text-white">Welcome back to JobAI</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              Sign in to continue exploring AI-ranked openings, resume insights, and streamlined application tracking.
            </p>
          </div>
          <div className="grid gap-4">
            {["AI-powered recommendations", "Premium recruiter-ready profile", "Clean application status tracking"].map((item) => (
              <div key={item} className="rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Secure Access</p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Login</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Use your account credentials to open the premium workspace. Recruiter accounts are created manually.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-4">
                <Mail className="h-5 w-5 text-cyan-200" />
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>
              {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email}</p> : null}
            </div>

            <div>
              <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/12 bg-slate-950/24 px-4 py-4">
                <Lock className="h-5 w-5 text-cyan-200" />
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </label>
              {errors.password ? <p className="mt-2 text-sm text-rose-300">{errors.password}</p> : null}
            </div>
          </div>

          {message ? <p className="mt-5 text-sm text-emerald-300">{message}</p> : null}

          <button
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-sm text-slate-300">
            Need an account?{" "}
            <Link to="/register" className="font-semibold text-cyan-100">
              Register
            </Link>
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-400">Demo tip: use `user@demo.com` or `recruiter@demo.com` with any 8+ character password.</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
