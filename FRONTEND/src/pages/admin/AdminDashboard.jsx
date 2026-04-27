import { useEffect, useState } from "react";
import Layout from "../../components/Layout.jsx";
import {
  Users, Briefcase, FileText, UserCircle,
  UserPlus, X, TrendingUp, Activity, ChevronRight, CheckCircle,
  Shield, ShieldOff, Trash2, AlertTriangle
} from "lucide-react";
import { adminApi } from "../../services/api.js";

const TABS = ["Overview", "Users", "Recruiters", "Jobs"];

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-slate-500">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active, activeText = "Active", blockedText = "Blocked" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
      {active ? activeText : blockedText}
    </span>
  );
}

function DataTable({ columns, data, emptyText }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-100 py-16 text-slate-400 bg-slate-50/50">
        <p className="text-sm font-medium text-slate-500">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} className="border-b border-slate-50 transition-colors hover:bg-blue-50/30">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-slate-700">{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState({ totalUsers: 0, totalRecruiters: 0, totalJobs: 0, activeJobs: 0, totalApplications: 0 });
  const [users, setUsers] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", company: "" });
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null });

  const loadStats = () => adminApi.getStats().then(({ data }) => setStats(data)).catch(console.error);
  const loadUsers = () => adminApi.getUsers().then(({ data }) => setUsers(data)).catch(console.error);
  const loadRecruiters = () => adminApi.getRecruiters().then(({ data }) => setRecruiters(data)).catch(console.error);
  const loadJobs = () => adminApi.getJobs().then(({ data }) => setJobs(data)).catch(console.error);

  useEffect(() => {
    Promise.all([loadStats(), loadUsers(), loadRecruiters(), loadJobs()]).finally(() => setLoading(false));
  }, []);

  const handleToggleBlockUser = async (id) => {
    try {
      const { data } = await adminApi.toggleBlockUser(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
      setRecruiters((prev) => prev.map((u) => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = (id, name) => {
    setConfirm({
      open: true, title: "Delete User", message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await adminApi.deleteUser(id);
          await loadUsers();
          await loadRecruiters();
          await loadStats();
        } catch (e) { console.error(e); }
        setConfirm({ open: false });
      }
    });
  };

  const handleToggleBlockJob = async (id) => {
    try {
      await adminApi.toggleBlockJob(id);
      await loadJobs();
      await loadStats();
    } catch (e) { console.error(e); }
  };

  const handleDeleteJob = (id, title) => {
    setConfirm({
      open: true, title: "Delete Job", message: `Are you sure you want to delete "${title}"? All associated applications will also be deleted.`,
      onConfirm: async () => {
        try {
          await adminApi.deleteJob(id);
          await loadJobs();
          await loadStats();
        } catch (e) { console.error(e); }
        setConfirm({ open: false });
      }
    });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteMessage("");
    try {
      await adminApi.inviteRecruiter(inviteForm);
      setInviteMessage("✅ Recruiter invited successfully! Email sent.");
      setTimeout(() => { setIsModalOpen(false); setInviteForm({ name: "", email: "", company: "" }); setInviteMessage(""); }, 2000);
    } catch (error) {
      setInviteMessage("❌ " + (error.response?.data?.message || "Failed to invite recruiter."));
    } finally { setIsInviting(false); }
  };

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (row) => <StatusBadge active={!row.isBlocked} /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleToggleBlockUser(row._id)} title={row.isBlocked ? "Unblock" : "Block"}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${row.isBlocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"}`}>
          {row.isBlocked ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
          {row.isBlocked ? "Unblock" : "Block"}
        </button>
        <button onClick={() => handleDeleteUser(row._id, row.name)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    )}
  ];

  const recruiterColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status", render: (row) => <StatusBadge active={!row.isBlocked} /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleToggleBlockUser(row._id)} title={row.isBlocked ? "Unblock" : "Block"}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${row.isBlocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"}`}>
          {row.isBlocked ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
          {row.isBlocked ? "Unblock" : "Block"}
        </button>
        <button onClick={() => handleDeleteUser(row._id, row.name)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    )}
  ];

  const jobColumns = [
    { key: "title", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status", render: (row) => <StatusBadge active={row.status === "active"} /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleToggleBlockJob(row._id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${row.status === "blocked" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"}`}>
          {row.status === "blocked" ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
          {row.status === "blocked" ? "Unblock" : "Block"}
        </button>
        <button onClick={() => handleDeleteJob(row._id, row.title)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    )}
  ];

  const statCards = [
    { label: "Job Seekers", value: stats.totalUsers, icon: Users, color: "blue" },
    { label: "Recruiters", value: stats.totalRecruiters, icon: UserCircle, color: "purple" },
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, color: "emerald" },
    { label: "Applications", value: stats.totalApplications, icon: FileText, color: "amber" },
  ];

  return (
    <Layout title="" subtitle="">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage platform users, recruiters, and jobs</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <UserPlus className="h-4 w-4" /> Invite Recruiter
        </button>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-blue-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === "Overview" && (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-50 text-${color}-600`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                      <span className="flex items-center font-medium text-emerald-600"><TrendingUp className="mr-1 h-3 w-3" /> Platform</span>
                      <span className="ml-2 text-slate-400">total count</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Recent Platform Activity</h2>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-100 py-12 text-slate-400 bg-slate-50/50">
                    <Activity className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No recent activity detected</p>
                    <p className="mt-1 text-xs text-slate-400">User registrations and job postings will appear here.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-bold text-slate-800">Quick Management</h2>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Manage Users", icon: Users, color: "blue", tab: "Users" },
                      { label: "Manage Recruiters", icon: CheckCircle, color: "emerald", tab: "Recruiters" },
                      { label: "Manage Jobs", icon: Briefcase, color: "purple", tab: "Jobs" },
                    ].map(({ label, icon: Icon, color, tab }) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-md bg-${color}-50 p-2 text-${color}-600 group-hover:bg-${color}-100`}><Icon className="h-4 w-4" /></div>
                          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                    <button onClick={() => setIsModalOpen(true)}
                      className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-100"><UserPlus className="h-4 w-4" /></div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Invite New Recruiter</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "Users" && (
            <div>
              <h2 className="mb-4 text-base font-bold text-slate-800">Job Seekers ({users.length})</h2>
              <DataTable columns={userColumns} data={users} emptyText="No users found" />
            </div>
          )}

          {activeTab === "Recruiters" && (
            <div>
              <h2 className="mb-4 text-base font-bold text-slate-800">Recruiters ({recruiters.length})</h2>
              <DataTable columns={recruiterColumns} data={recruiters} emptyText="No recruiters found" />
            </div>
          )}

          {activeTab === "Jobs" && (
            <div>
              <h2 className="mb-4 text-base font-bold text-slate-800">All Jobs ({jobs.length})</h2>
              <DataTable columns={jobColumns} data={jobs} emptyText="No jobs found" />
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <button onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invite Recruiter</h2>
                <p className="text-sm text-slate-500">Send an invitation to join the platform.</p>
              </div>
            </div>
            {inviteMessage && (
              <div className={`mb-5 rounded-lg p-3 text-sm font-medium ${inviteMessage.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                {inviteMessage}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <input required type="text" placeholder="e.g. John Doe" value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <input required type="email" placeholder="john@company.com" value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Company Name</label>
                <input required type="text" placeholder="e.g. Google, TechCorp" value={inviteForm.company}
                  onChange={(e) => setInviteForm({...inviteForm, company: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isInviting}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 flex justify-center items-center gap-2">
                  {isInviting ? (<><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> Sending Invitation...</>) : "Send Invitation Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal open={confirm.open} title={confirm.title} message={confirm.message}
        onConfirm={confirm.onConfirm} onCancel={() => setConfirm({ open: false })} />
    </Layout>
  );
}

export default AdminDashboard;