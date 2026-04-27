import { useEffect, useState } from "react";
import Layout from "../../components/Layout.jsx";
import {
  Users, Briefcase, FileText, UserCircle,
  UserPlus, X, TrendingUp, Activity, ChevronRight, CheckCircle
} from "lucide-react";
import { adminApi } from "../../services/api.js";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRecruiters: 0, totalJobs: 0, totalApplications: 0 });
  const [loading, setLoading] = useState(true);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", company: "" });
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const [activeTab, setActiveTab] = useState("overview"); // overview, users, jobs
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setDataLoading(true);
    try {
      const { data } = await adminApi.getUsers();
      console.log("Fetched users:", data.data);
      setUsers(data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchJobs = async () => {
    setDataLoading(true);
    try {
      const { data } = await adminApi.getJobs();
      console.log("Fetched jobs:", data.data);
      setJobs(data.data);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "jobs") fetchJobs();
  }, [activeTab]);

  const handleToggleBlock = async (userId) => {
    try {
      await adminApi.toggleUserBlock(userId);
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle block status", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      await adminApi.toggleJobDisable(jobId);
      fetchJobs();
    } catch (error) {
      console.error("Failed to toggle job status", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await adminApi.deleteJob(jobId);
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete job", error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteMessage("");

    try {
      await adminApi.inviteRecruiter(inviteForm);
      setInviteMessage("✅ Recruiter invited successfully! Email sent.");
      setTimeout(() => {
        setIsModalOpen(false);
        setInviteForm({ name: "", email: "", company: "" });
        setInviteMessage("");
      }, 2000);
    } catch (error) {
      setInviteMessage("❌ " + (error.response?.data?.message || "Failed to invite recruiter."));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Layout title="" subtitle="">


      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, jobs and monitor platform growth</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Invite Recruiter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "overview" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "users" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "jobs" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Job Management
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Job Seekers</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className="flex items-center font-medium text-emerald-600"><TrendingUp className="mr-1 h-3 w-3" /> +12%</span>
                    <span className="ml-2 text-slate-400">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Recruiters</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalRecruiters}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <UserCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className="flex items-center font-medium text-emerald-600"><TrendingUp className="mr-1 h-3 w-3" /> +4%</span>
                    <span className="ml-2 text-slate-400">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Active Jobs</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalJobs}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className="flex items-center font-medium text-emerald-600"><TrendingUp className="mr-1 h-3 w-3" /> +18%</span>
                    <span className="ml-2 text-slate-400">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Applications</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className="flex items-center font-medium text-emerald-600"><TrendingUp className="mr-1 h-3 w-3" /> +24%</span>
                    <span className="ml-2 text-slate-400">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Recent Platform Activity</h2>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">View Report</button>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-100 py-12 text-slate-400 bg-slate-50/50">
                    <Activity className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No recent activity detected</p>
                    <p className="mt-1 text-xs text-slate-400">User registrations and job postings will appear here.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-bold text-slate-800">Quick Actions</h2>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setActiveTab("users")} className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100"><Users className="h-4 w-4" /></div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">Manage Users</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button onClick={() => setActiveTab("jobs")} className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-100"><Briefcase className="h-4 w-4" /></div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Manage Jobs</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800">User Management</h2>
              </div>
              {dataLoading ? (
                <div className="p-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{u.name}</div>
                                  <div className="text-xs text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : u.role === 'recruiter' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${u.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleToggleBlock(u._id)}
                                  disabled={u.role === 'admin'}
                                  className={`rounded px-3 py-1 text-xs font-semibold transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'} disabled:opacity-50`}
                                >
                                  {u.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={u.role === 'admin'}
                                  className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800">Job Management</h2>
              </div>
              {dataLoading ? (
                <div className="p-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3">Job Details</th>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No jobs found.</td></tr>
                      ) : (
                        jobs.map((j) => (
                          <tr key={j._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">{j.title}</div>
                              <div className="text-xs text-slate-500">{j.location}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-600">{j.company}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${j.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {j.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleToggleJob(j._id)}
                                  className={`rounded px-3 py-1 text-xs font-semibold transition-all ${!j.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                >
                                  {j.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(j._id)}
                                  className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md scale-100 rounded-2xl bg-white p-7 shadow-2xl transition-transform">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
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
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Google, TechCorp"
                  value={inviteForm.company}
                  onChange={(e) => setInviteForm({...inviteForm, company: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isInviting}
                  className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Sending Invitation...
                    </>
                  ) : "Send Invitation Email"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default AdminDashboard;