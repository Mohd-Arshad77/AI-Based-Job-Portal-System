import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Loader from "./components/Loader.jsx";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyRecruiter from "./pages/auth/VerifyRecruiter.jsx";

import Dashboard from "./pages/user/Dashboard.jsx";
import Profile from "./pages/user/Profile.jsx";
import Jobs from "./pages/user/Jobs.jsx";
import JobDetails from "./pages/user/JobDetails.jsx";
import Applications from "./pages/user/Applications.jsx";
import ResumeUpload from "./pages/user/ResumeUpload.jsx";

import ManageJobs from "./pages/recruiter/ManageJobs.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import NotificationToast from "./components/NotificationToast.jsx";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Preparing your workspace..." />
      </div>
    );
  }

  return (
    <>
      <NotificationToast />
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { fontSize: "14px" } }} />

      <Routes>

        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-recruiter" element={<PublicRoute><VerifyRecruiter /></PublicRoute>} />

        <Route element={<ProtectedRoute roles={["user"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<ResumeUpload />} />
        </Route>

        <Route element={<ProtectedRoute roles={["recruiter"]} />}>
          <Route path="/recruiter/manage" element={<ManageJobs />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
}

export default App;
