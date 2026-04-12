import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/user/Dashboard.jsx";
import Profile from "./pages/user/Profile.jsx";
import Jobs from "./pages/user/Jobs.jsx";
import JobDetails from "./pages/user/JobDetails.jsx";
import Applications from "./pages/user/Applications.jsx";
import ResumeUpload from "./pages/user/ResumeUpload.jsx";
import CreateJob from "./pages/recruiter/CreateJob.jsx";
import ManageJobs from "./pages/recruiter/ManageJobs.jsx";
import AdminRoute from "./components/AdminRoutes.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import VerifyRecruiter from "./pages/auth/VerifyRecruiter.jsx";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES (എല്ലാവർക്കും കാണാവുന്നത്) ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* വെരിഫിക്കേഷൻ പേജ് ഇവിടേക്ക് മാറ്റി! */}
      <Route path="/verify-recruiter" element={<VerifyRecruiter />} /> 

      {/* ================= USER PROTECTED ROUTES ================= */}
      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume" element={<ResumeUpload />} />
      </Route>

      {/* ================= RECRUITER PROTECTED ROUTES ================= */}
      <Route element={<ProtectedRoute roles={["recruiter"]} />}>
        <Route path="/recruiter/dashboard" element={<ManageJobs />} />
        <Route path="/recruiter/manage" element={<ManageJobs />} />
        <Route path="/recruiter/create" element={<ManageJobs />} />
        {/* Verify പേജ് ഇവിടെ നിന്ന് മാറ്റി */}
      </Route>
      
      {/* ================= ADMIN PROTECTED ROUTE ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;