import Sidebar from "./Sidebar.jsx";
import { AppTopbar } from "./Navbar.jsx";

function Layout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-indigo-500/24 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-cyan-400/16 blur-3xl" />
      </div>

      <main className="relative mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="min-w-0 flex-1 space-y-6">
          <AppTopbar title={title} subtitle={subtitle} />
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
