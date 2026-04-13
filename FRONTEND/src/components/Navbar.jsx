import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const workspaceLink = user?.role === "recruiter" ? "/recruiter/manage" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-4 transition-transform hover:opacity-90">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <p className="text-xl font-bold tracking-tight text-slate-900">JobFlow</p>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {user?.role !== "recruiter" && (
            <NavLink to="/" end className={({ isActive }) => `rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${isActive ? "bg-green-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              Home
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" className={({ isActive }) => `rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              Login
            </NavLink>
          )}
          {user?.role === "user" && (
            <NavLink to="/jobs" className={({ isActive }) => `rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              Explore Jobs
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-medium text-slate-500 lg:inline">
                {user.company || user.name}
              </span>
              <Link to={workspaceLink} className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:inline-flex">
                Workspace
              </Link>
              <button onClick={handleLogout} className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-rose-100">
                <LogOut className="h-4 w-4 text-slate-500 transition-colors group-hover:text-rose-600" />
              </button>
            </div>
          ) : (
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
