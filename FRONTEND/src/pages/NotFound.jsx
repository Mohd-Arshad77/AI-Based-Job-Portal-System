import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "recruiter") {
        navigate("/recruiter/manage");
      } else if (user?.role === "user") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          Page not found
        </h2>

        <p className="mt-2 text-gray-500 text-sm">
          The page you’re trying to access doesn’t exist or may have been moved.
        </p>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/")
          }
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 
                     rounded-md border border-gray-300 
                     text-sm font-medium text-gray-700 
                     hover:bg-gray-100 transition"
        >
          ← Go back
        </button>

        <p className="mt-4 text-xs text-gray-400">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default NotFound;