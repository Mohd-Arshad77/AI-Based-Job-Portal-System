import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { recruiterApi } from "../../services/api.js";

function VerifyRecruiter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const defaultEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: defaultEmail,
    code: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }


    if (form.code.length !== 6) {
      return setError("Verification code must be 6 digits.");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans selection:bg-blue-200">
      <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-xl shadow-slate-200/50">


        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">Verify Account</h2>
          <p className="mt-2 text-sm font-medium text-blue-100">
            Enter the 6-digit code sent to your email to activate your recruiter account.
          </p>
        </div>


        <div className="p-8">
          {success ? (
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
              <h3 className="text-xl font-bold text-slate-800">Account Verified!</h3>
              <p className="mt-2 text-sm text-slate-500">
                Your recruiter account is now active. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-100">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="6-Digit Verification Code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm font-semibold tracking-[0.2em] outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="New Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify & Activate Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

            </form>
          )}
        </div>


        {!success && (
          <div className="bg-slate-50 py-4 text-center text-sm font-medium text-slate-500">
            Already verified? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyRecruiter;