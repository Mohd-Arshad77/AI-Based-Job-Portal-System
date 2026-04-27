import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : "";
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : "";

export default function NotificationToast() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (user && user._id) {
      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        socket.emit("register_user", user._id);
      });

      const addToast = (message) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      };

      socket.on("new_application", (data) => addToast(data.message));
      socket.on("high_quality_candidate", (data) => addToast(data.message));
      socket.on("profile_viewed", (data) => addToast(data.message));
      socket.on("new_job_match", (data) => addToast(data.message));
      socket.on("interview_reminder", (data) => addToast(data.message));

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-l-4 border-indigo-500 shadow-xl p-4 rounded-md flex items-start gap-4 min-w-[300px] max-w-[400px]"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors mt-0.5"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
