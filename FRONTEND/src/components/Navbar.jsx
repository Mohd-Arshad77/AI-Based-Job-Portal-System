import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, LogOut, User, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { notificationApi } from "../services/api.js";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      const fetchNotifications = async () => {
        try {
          const { data } = await notificationApi.list();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      
      fetchNotifications();

      const socket = io(SOCKET_URL);
      
      socket.on("connect", () => {
        socket.emit("register_user", user._id);
      });

      socket.on("new_notification", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await notificationApi.markAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hours ago`;
    return `${Math.floor(diff/1440)} days ago`;
  };

  const workspaceLink = user?.role === "admin" 
    ? "/admin" 
    : user?.role === "recruiter" 
      ? "/recruiter/dashboard" 
      : "/dashboard";

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
            {!user && (
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

            {user?.role === "admin" && (
              <>
                <NavLink to="/admin" className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${isActive ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" : "font-medium text-slate-500 py-1"}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin" className="text-sm font-medium text-slate-500 py-1 hover:text-indigo-950">
                  Manage Users
                </NavLink>
                <NavLink to="/admin" className="text-sm font-medium text-slate-500 py-1 hover:text-indigo-950">
                  Manage Jobs
                </NavLink>
              </>
            )}

            {user?.role === "user" && (
              <>
                <NavLink to="/profile" className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${isActive ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" : "font-medium text-slate-500 py-1"}`}>
                  Profile
                </NavLink>
                <NavLink to="/jobs" className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${isActive ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" : "font-medium text-slate-500 py-1"}`}>
                  Jobs
                </NavLink>
              </>
            )}

            {user?.role === "recruiter" && (
              <>
                <NavLink to="/recruiter/manage" className={({ isActive }) => `text-sm transition-all hover:text-indigo-950 ${isActive ? "font-semibold text-indigo-900 border-b-2 border-indigo-600 py-1" : "font-medium text-slate-500 py-1"}`}>
                  Manage Jobs
                </NavLink>
                <NavLink to="/recruiter/manage" className="text-sm font-medium text-slate-500 py-1 hover:text-indigo-950">
                  Applicants
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-5">
              <div className="hidden items-center gap-2 lg:flex">
                <button onClick={() => navigate('/profile')} className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                  <User className="h-4 w-4" />
                </button>
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
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:border-indigo-200 hover:bg-indigo-50"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 text-slate-500 hover:text-indigo-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/80">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAsRead}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500 bg-white">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            className={`border-b border-slate-50 px-4 py-3 transition-colors ${!notif.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'bg-white hover:bg-slate-50'}`}
                          >
                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                              {notif.message}
                            </p>
                            <p className="mt-1.5 text-xs font-medium text-slate-400">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
