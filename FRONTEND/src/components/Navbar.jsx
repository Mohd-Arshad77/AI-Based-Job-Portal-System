import { Link, NavLink } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Jobs" },
  { to: "/login", label: "Login" }
];

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/12 bg-slate-950/35 px-5 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.24)] backdrop-blur-2xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-indigo-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-300/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">JobAI</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Job Portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={user.role === "recruiter" ? "/manage-jobs" : "/dashboard"}
                  className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12 sm:inline-flex"
                >
                  Workspace
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-slate-300 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppTopbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-white/12 bg-white/8 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">AI-Based Job Portal System</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/10 bg-slate-950/28 px-4 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/90 via-indigo-400/90 to-violet-500/90 text-slate-950">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user?.name || "Guest User"}</p>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{user?.role || "workspace"}</p>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
