import Navbar from "./Navbar.jsx";

function Layout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {(title || subtitle) ? (
          <div className="mb-8">
            {title ? <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1> : null}
            {subtitle ? <p className="mt-2 text-base text-slate-500">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}

export default Layout;
