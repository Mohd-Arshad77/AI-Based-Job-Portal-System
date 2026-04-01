import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  PlusSquare,
  Sparkles,
  Users,
  UserCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navigationByRole = {
  user: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { to: "/applications", label: "Applications", icon: Sparkles },
    { to: "/resume-upload", label: "Resume", icon: FileText },
    { to: "/profile", label: "Profile", icon: UserCircle2 }
  ],
  recruiter: [
    { to: "/create-job", label: "Create Job", icon: PlusSquare },
    { to: "/manage-jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { to: "/applicants", label: "Applicants", icon: Users }
  ]
};

function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  const links = navigationByRole[user?.role] || navigationByRole.user;

  return (
    <aside className="hidden w-80 shrink-0 xl:block">
      <div className="sticky top-6 overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
        <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/25 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">JobAI Workspace</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Focused hiring cockpit</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">A clean workspace for job seekers and recruiters.</p>
        </div>
        <nav className="mt-6 space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/manage-jobs"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-cyan-300/30 bg-cyan-300/14 text-white shadow-[0_12px_35px_rgba(34,211,238,0.16)]"
                    : "border border-transparent text-slate-300 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
