import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, LogOut, User } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-12">
          <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center text-indigo-900">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <p className="text-xl font-bold tracking-tight text-indigo-950">JobFlow</p>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {user?.role !== "recruiter" && (
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${
                  isActive 
                    ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" 
                    : "font-medium text-slate-500 py-1"
                }`}
              >
                Home
              </NavLink>
            )}
            
            {user?.role === "user" && (
              <NavLink 
                to="/jobs" 
                className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${
                  isActive 
                    ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" 
                    : "font-medium text-slate-500 py-1"
                }`}
              >
                Explore Jobs
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-5">
              <div className="hidden items-center gap-2 lg:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user.company || user.name}
                </span>
              </div>
              
              <Link 
                to={workspaceLink} 
                className="hidden rounded-md bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 sm:inline-flex"
              >
                Dashboard
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:border-rose-200 hover:bg-rose-50"
                title="Log out"
              >
                <LogOut className="h-4 w-4 text-slate-400 transition-colors group-hover:text-rose-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <NavLink 
                to="/login" 
                className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-indigo-950 sm:block"
              >
                Sign In
              </NavLink>
              
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center rounded-md bg-indigo-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-800"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}

export default Navbar;
