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

  useEffect(() => {
    adminApi.getStats()
      .then(({ data }) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch admin stats", error);
        setLoading(false);
      });
  }, []);

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
          <h1 className="text-xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor system metrics and manage users</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Recruiter
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      ) : (
        <>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">


            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Job Seekers</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">View Report</button>
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
                <button className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100"><Users className="h-4 w-4" /></div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Manage Users</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                <button className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-100"><CheckCircle className="h-4 w-4" /></div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Review Pending Jobs</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50"
                >
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
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isInviting}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 flex justify-center items-center gap-2"
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