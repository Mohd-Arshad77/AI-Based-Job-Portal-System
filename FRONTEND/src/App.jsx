import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Applications from "./pages/Applications.jsx";
import CreateJob from "./pages/CreateJob.jsx";
import ManageJobs from "./pages/ManageJobs.jsx";
import Applicants from "./pages/Applicants.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/applications" element={<Applications />} />
      </Route>

      <Route element={<ProtectedRoute roles={["recruiter"]} />}>
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
        <Route path="/applicants" element={<Applicants />} />
      </Route>
    </Routes>
  );
}

export default App;
