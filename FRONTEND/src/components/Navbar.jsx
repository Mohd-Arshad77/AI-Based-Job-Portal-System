import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
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
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-2xl font-semibold text-slate-950">JobFlow</p>
            </div>
            {user ? <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-700 capitalize">{user.role}</span> : null}
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {user?.role !== "recruiter" && <NavLink to="/" end className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>Home</NavLink>}
          {!user ? <NavLink to="/login" className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>Login</NavLink> : null}
          {user?.role === "user" ? <NavLink to="/jobs" className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>Jobs</NavLink> : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 lg:inline">{user.company || user.name}</span>
              <Link to={workspaceLink} className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 sm:inline-flex">
                Workspace
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-slate-950 hover:text-blue-700">
                Logout
              </button>
            </>
          ) : (
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
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
